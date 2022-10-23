import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile } from '../api/diaries-api'
import { createDiary } from '../api/diaries-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface CreateDiaryProps {
  match: {
    params: {
    }
  }
  auth: Auth
}

interface CreateDiaryState {
  file: any
  uploadState: UploadState
  newDiaryTitle: any
  newDiaryContent: any
  newDiaryImageUrl: any
}

export class CreateDiary extends React.PureComponent<
  CreateDiaryProps,
  CreateDiaryState
> {
  state: CreateDiaryState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    newDiaryTitle: '',
    newDiaryContent: '',
    newDiaryImageUrl: ''
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
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
      this.state.newDiaryImageUrl = uploadUrl

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

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

  onDiaryCreate = async () => {
    try {
      await createDiary(this.props.auth.getIdToken(), {
        title: this.state.newDiaryTitle,
        content: this.state.newDiaryContent,
        attachmentUrl: this.state.newDiaryImageUrl
      })
    } catch {
      alert('Diary creation failed')
    }
  }

  render() {
    return (
      <div>
        <h1>Create My Diary</h1>

        <Form onSubmit={this.handleUpload}>
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
              placeholder="test1"
            />
          </Form.Field>
          <Form.Field>
            <label>My Content</label>
            <textarea
              name="Text1"
              placeholder="test2"
            />
          </Form.Field>
          <Button
            onClick={this.onDiaryCreate}
            color = "teal"
          >
            Create me
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
        >
          Upload
        </Button>
      </div>
    )
  }
}
