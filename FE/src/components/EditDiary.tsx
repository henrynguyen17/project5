import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getDiaryById, getUploadUrl, uploadFile } from '../api/diaries-api'
import { patchDiary } from '../api/diaries-api'
import { History } from 'history'
import { Image } from 'semantic-ui-react'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditDiaryProps {
  match: {
    params: {
      diaryId: string
    }
  }
  auth: Auth
  history: History
}

interface EditDiaryState {
  file: any
  uploadState: UploadState
  editTitle: any
  editContent: any
  editDiaryImageUrl: any
}

export class EditDiary extends React.PureComponent<
  EditDiaryProps,
  EditDiaryState
> {
  state: EditDiaryState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    editTitle: '$onload',
    editContent: '$onload',
    editDiaryImageUrl: '$onload'
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ editTitle: event.target.value })
  }

  handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ editContent: event.target.value })
  }

  handleUpload = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    const currentImageUrl = this.state.editDiaryImageUrl

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setState({
        editDiaryImageUrl: "$onload"
      })

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken())

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      this.setState({
        editDiaryImageUrl: uploadUrl
      })

      alert('File was uploaded!')
    } catch (e) {
      this.setState({
        editDiaryImageUrl: currentImageUrl
      })
      alert('Could not upload a file: ' + (e as Error).message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  onDiaryUpdate = async (diaryId: string) => {
    if (this.state.editTitle < 10){
      alert("title is too short")
      return
    }

    if (this.state.editContent < 10){
      alert("content is too short")
      return
    }

    try {
      await patchDiary(this.props.auth.getIdToken(),
      diaryId, {
        title: this.state.editTitle,
        content: this.state.editContent,
        attachmentUrl: this.state.editDiaryImageUrl
      })

      alert('Diary is updated successfully')

      this.props.history.push(`/`)
    } catch {
      alert('Diary update failed')
    }
  }

  async componentDidMount() {
    try {
      const getDiary = await getDiaryById(this.props.auth.getIdToken(), this.props.match.params.diaryId)
      this.setState({
        editDiaryImageUrl: getDiary.attachmentUrl,
        editTitle: getDiary.title,
        editContent: getDiary.content
      })
    } catch (e) {
      alert(`Failed to fetch diaries: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <h1>Edit My Diary</h1>

        <Form onSubmit={this.handleUpload} >
          <Form.Field>
            <label>My Picture</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>
          {this.renderButton()}
          <Form loading={this.state.editDiaryImageUrl === '$onload'}>
            {this.state.editDiaryImageUrl && (
                    <Image src={this.state.editDiaryImageUrl} size="small" wrapped />
                  )}
          </Form>
        </Form>
        <Form loading={this.state.editTitle === '$onload'}>
          <Form.Field>
            <label>My Title</label>
            <input
              type="text"
              placeholder="your title"
              onChange={this.handleTitleChange}
              value={this.state.editTitle}
            />
          </Form.Field>
          <Form.Field>
            <label>My Content</label>
            <input
              type="text"
              placeholder="your content"
              onChange={this.handleContentChange}
              value={this.state.editContent}
            />
          </Form.Field>
          <Button
            onClick={() => this.onDiaryUpdate(this.props.match.params.diaryId)}
            color = "teal"
          >
            Save me
          </Button>
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
          color="facebook"
        >
          Upload
        </Button>
      </div>
    )
  }
}
