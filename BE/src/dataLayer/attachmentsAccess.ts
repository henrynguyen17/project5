import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const logger = createLogger('S3 Attachment')

export class AttachmentsAccess {
    async uploadImage(): Promise<string> {
        const imageId = uuid.v4();
        s3.getSignedUrl("putObject", {
          Bucket: bucketName,
          Key: imageId,
          Expires: parseInt(urlExpiration),
        });

        return await this.getAttachmentUrl(imageId);
    }

    getAttachmentUrl(imageId: string): string {
        const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`
        return attachmentUrl;
    }
      
    async removeAttachment(imageId: string): Promise<void> {
        const params = {
          Bucket: bucketName,
          Key: imageId,
        };
    
        try {
          // await s3.headObject(params).promise();
          // logger.info("File found in S3...!");
    
          try {
            await s3.deleteObject(params).promise();
            logger.info("File successfully deleted...!");
          }
          catch (err) {
            logger.error("Failed to delete: " + JSON.stringify(err));
          }
        } 
        catch (err) {
          logger.error("File not found: " + err.code);
        }
        
    }
}
