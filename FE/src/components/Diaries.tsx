import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { deleteDiary, getDiaries, searchDiaries } from '../api/diaries-api'
import Auth from '../auth/Auth'
import { Diary } from '../types/Diary'

interface DiariesProps {
  auth: Auth
  history: History
}

interface DiariesState {
  diaries: Diary[]
  searchText: string
  newDiaryTitle: string
  loadingDiaries: boolean
}

export class Diaries extends React.PureComponent<DiariesProps, DiariesState> {
  state: DiariesState = {
    diaries: [],
    searchText: '',
    newDiaryTitle: '',
    loadingDiaries: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchText: event.target.value })
  }

  onEditButtonClick = (diaryId: string) => {
    this.props.history.push(`/diaries/${diaryId}/edit`)
  }

  onCreateButtonClick = () => {
    this.props.history.push(`/diaries/create`)
  }

  onDiarySearch = async () => {
    try {
      if (this.state.searchText === ''){
        this.componentDidMount()
        return
      }
      const searchedDiaries = await searchDiaries(this.props.auth.getIdToken(), this.state.searchText)
      
      this.setState({
        diaries: searchedDiaries.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1)
      })
    } catch {
      alert('Diary search failed')
    }
  }

  onDiaryDelete = async (diaryId: string) => {
    try {
      await deleteDiary(this.props.auth.getIdToken(), diaryId)
      this.setState({
        diaries: this.state.diaries.filter(diary => diary.diaryId !== diaryId)
      })
      alert('Diary is deleted successfully')
    } catch {
      alert('Diary deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const diaries = await getDiaries(this.props.auth.getIdToken())
      this.setState({
        diaries,
        loadingDiaries: false
      })
    } catch (e) {
      alert(`Failed to fetch diaries: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">MY DIARIES</Header>

        {this.renderDiaryInputs()}
        {this.renderDiaries()}
      </div>
    )
  }

  renderDiaryInputs() {
    return (
      <Grid.Row>
        <Button
           icon='add'
           floated='right'
           color="yellow"
           content="New Diary"
           onClick={this.onCreateButtonClick}
          >
          </Button>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'search',
              content: 'Search My Diary',
              onClick: this.onDiarySearch
            }}
            fluid
            actionPosition="left"
            placeholder="Your text to search"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderDiaries() {
    if (this.state.loadingDiaries) {
      return this.renderLoading()
    }

    return this.renderDiariesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Diaries
        </Loader>
      </Grid.Row>
    )
  }

  renderDiariesList() {
    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column as="h3" width={3}>Image</Grid.Column>
          <Grid.Column as="h3" width={4}>Title</Grid.Column>
          <Grid.Column as="h3" width={4}>Content</Grid.Column>
          <Grid.Column as="h3" width={3}>Date Created</Grid.Column>
          <Grid.Column as="h3" width={2}>Actions</Grid.Column>
          <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
        </Grid.Row>
        
        {this.state.diaries.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1).map((diary) => {
          return (
            <Grid.Row key={diary.diaryId}>
              <Grid.Column width={3} verticalAlign="middle">
                {diary.attachmentUrl && (
                  <Image src={diary.attachmentUrl} size="small" wrapped />
                )}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {diary.title}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {diary.content}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {diary.createdAt}
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(diary.diaryId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onDiaryDelete(diary.diaryId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

}
