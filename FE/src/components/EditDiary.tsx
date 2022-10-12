import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile } from '../api/diaries-api'

import { patchDiary } from '../api/diaries-api'
import { UpdateDiaryRequest } from '../types/UpdateDiaryRequest'

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
}

export class EditDiary extends React.PureComponent<
  EditDiaryProps,
  EditDiaryState
> {
  state: EditDiaryState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    editTitle: '',
    editContent: ''
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.diaryId)

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

  onDiaryUpdate = async (diaryId: string) => {
    try {
      await patchDiary(this.props.auth.getIdToken(),
      diaryId, {
        title: this.state.editTitle,
        content: this.state.editContent,
      })
    } catch {
      alert('Diary update failed')
    }
  }

  render() {
    return (
      <div>
        <h1>Edit My Diary</h1>

        <Form onSubmit={this.handleSubmit}>
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
            //onClick={this.onDiaryUpdate('diaryId')}
            color = "teal"
            type="submit"
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
        >
          Upload
        </Button>
      </div>
    )
  }
}
