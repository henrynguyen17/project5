import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getDiaryById, getUploadUrl, uploadFile } from '../api/diaries-api'
import { patchDiary } from '../api/diaries-api'
import { Diary } from '../types/Diary'

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
}

interface EditDiaryState {
  file: any
  uploadState: UploadState
  editTitle: any
  editContent: any
  editDiaryImageUrl: any
  diary: Diary
}

export class EditDiary extends React.PureComponent<
  EditDiaryProps,
  EditDiaryState
> {
  state: EditDiaryState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    editTitle: '',
    editContent: '',
    editDiaryImageUrl: '',
    diary: { diaryId: '', title: '', content: '', createdAt: '', attachmentUrl: ''}
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

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken())

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      this.setState({
        editDiaryImageUrl: uploadUrl
      })

      alert('File was uploaded!')
    } catch (e) {
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
    try {
      await patchDiary(this.props.auth.getIdToken(),
      diaryId, {
        title: this.state.editTitle,
        content: this.state.editContent,
        attachmentUrl: this.state.editDiaryImageUrl
      })
    } catch {
      alert('Diary update failed')
    }
    finally{
      
    }
  }

  async componentDidMount() {
    try {
      const getDiary = await getDiaryById(this.props.auth.getIdToken(), this.props.match.params.diaryId)
      this.setState({
        diary: {
          diaryId: getDiary.diaryId,
          title: getDiary.title,
          content: getDiary.content,
          createdAt: getDiary.createdAt,
          attachmentUrl: getDiary.attachmentUrl
        },
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

        <Form>
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
        </Form>
        <Form>
          <Form.Field>
            <label>My Title</label>
            <input
              type="text"
              placeholder="your title"
              onChange={this.handleTitleChange}
              value={this.state.diary.title}
            />
          </Form.Field>
          <Form.Field>
            <label>My Content</label>
            <input
              type="text"
              placeholder="your content"
              onChange={this.handleContentChange}
              value={this.state.diary.content}
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
