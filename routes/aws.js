//add dotenv functionality
require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer  = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const pool = require('../modules/dbcon').pool;


const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
});


router.post('/upload', (req, res) => {
        let uploadS3 = multer({
            storage: multerS3({
                s3: s3,
                acl: 'public-read',
                bucket: process.env.AWS_BUCKET,
                metadata: (req, file, cb) => {
                    cb(null, {fieldName: file.fieldname})
                },
                key: (req, file, cb) => {
                    cb(null, Date.now().toString() + '_' + file.originalname)
                }
            }),
            fileFilter:imageFilter
        }).array('aws_multiple_images');

        uploadS3(req, res, function(err){
            if(req.body.newFileCt > 0){
                if (req.fileValidationError) {
                    return res.send({err:req.fileValidationError,uploadStatus:"Failed to upload attachment(s)!"});
                }
                else if (!req.files) {
                    return res.send({err:'Please select an image to upload',uploadStatus:"Failed to upload attachment(s)!"});
                }
                else if (err instanceof multer.MulterError) {
                    return res.send({err:err,uploadStatus:"Failed to upload attachment(s)!"});
                }
                else if (err) {
                    return res.send({err:err,uploadStatus:"Failed to upload attachment(s)!"});
                }
            
                console.log(req.body.listId);
                console.log(req.body.newFileCt);

                //build the img locations and send back
                let entryArr = [];
                let context = {};
                context.images = [];
                for(let i = 0; i < req.files.length; i++){
                    let tmp = req.files[i].location.split('/');
                    entryArr.push([req.body.listId,tmp[tmp.length-1],req.files[i].location]);
                    context.images.push({location: req.files[i].location});
                }

                //add to database  
                let value = [entryArr];
                pool.query('INSERT INTO Attachments (itemID,attName,attDescr) VALUES ?;',value, function (err, result){
                    if(err){
                        context.err = err;
                        context.uploadStatus = "Failed to upload attachment(s)!"
                    }else{
                        context.uploadStatus = "Attachment(s) uploaded successfully!";
                    }
                    res.send(context);
                    
                });
            }else{
                res.send({uploadStatus:"No file to upload!"});
            }
        });
    
  });


router.post('/delete', (req,res)=>{
    //req.body.deleteList has array of attachment information:
    //an object: {deleteCt:,files:[{attachId:,filename:}]}
    let deleteCt = req.body.deleteList.deleteCt;
    let fileList = req.body.deleteList.files;
    console.log(fileList[0]);

    if(deleteCt > 0){

        let parmas = {
            Bucket:process.env.AWS_BUCKET
        }

        //set file into paramas and sql query
        let fileArr = [];
        let idArr = "(";
        for(let i = 0; i < fileList.length; i++){
            fileArr.push({Key:fileList[i].filename});
            idArr = idArr + fileList[i].attachId + ",";
        }
        idArr = idArr.substr(0,idArr.length-1) + ")";
        parmas.Delete = {Objects:fileArr,Quiet:false};

        console.log(fileArr);
        console.log(idArr);
        //delete the attachment from the attachment table
        pool.query('DELETE FROM Attachments WHERE attachmentID IN ' + idArr, function (err, result){
            let context = {};
            if(err){
                context.err = err;
                context.deleteStatus = "Cannot remove entries from database!";
            }else{
                //ask aws to delete files
                s3.deleteObjects(parmas, function(err, data){                   
                    if(err){
                        context.err = err;
                        context.deleteStatus = "Cannot delete attachments from AWS!";
                    }else{
                        context.data = data;
                        context.deleteStatus = "Attachments deleted successfully!";
                    }
                })
            }
            res.send(context);
            console.log(context);
        })
        
    }else{
        res.send({data:"No file needs to be deleted!"});
    }
})


//functions
function imageFilter(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

module.exports = router;