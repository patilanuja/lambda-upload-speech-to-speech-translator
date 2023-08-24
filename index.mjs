'use strict';

import { v4 as uuidv4 } from 'uuid';

import AWS from 'aws-sdk';

AWS.config.update({
    signatureVersion: 'v4',
    region: process.env.AWS_REGION,
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
});

const s3 = new AWS.S3();

export const handler = async (event, context) => {
    console.log('Event: ' + JSON.stringify(event));
    console.log('Context: ' + JSON.stringify(context));
    return await getUploadURL(event);
}

const getUploadURL = async function (event) {
    try {
        let filename = uuidv4().replace(/-/g, '') + '.' + JSON.parse(event.body).contentType.match(/\/(.*)/)[1];

        let s3Params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: filename,
            Expires: parseInt(process.env.AWS_S3_URL_EXPIRATION),
            ContentType: JSON.parse(event.body).contentType,
            ACL: 'public-read-write'
        }

        console.log('Params: ', s3Params)
        let uploadURL = await s3.getSignedUrlPromise('putObject', s3Params)

        let response = JSON.stringify({
            uploadURL: uploadURL,
            filename: filename
        });
        console.log(response);

        return {
            statusCode: 200,
            body: response
        }
    } catch (error) {
        console.error(error)
        return {
            statusCode: 500
        };
    }
}