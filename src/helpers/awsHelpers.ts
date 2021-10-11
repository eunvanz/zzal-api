import * as AWS from 'aws-sdk';
// import multer from 'multer';
import * as multerS3 from 'multer-s3';

export const s3 = new AWS.S3();

export const getMulterOptions = () => ({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {
        // path: req.body.path,
        contentType: file.mimetype,
      });
    },
    key: function (_req, file, cb) {
      const { originalname } = file;
      const fileExtension = originalname.split('.').pop();
      const fileName = `${originalname}_${Date.now()}.${fileExtension}}`;
      cb(null, fileName);
    },
  }),
});

export const initAWS = () => {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
};

// export const uploadFile = multer({
//   storage: multerS3({
//     s3,
//     bucket: process.env.AWS_S3_BUCKET_NAME,
//     acl: 'public-read',
//     metadata: function (path, file, cb) {
//       cb(null, {
//         path: path,
//         contentType: file.mimetype,
//       });
//     },
//     key: function (_path, file, cb) {
//       const { originalname } = file;
//       const fileExtension = originalname.split('.').pop();
//       const fileName = `${originalname}_${Date.now()}.${fileExtension}}`;
//       cb(null, fileName);
//     },
//   }),
// });
