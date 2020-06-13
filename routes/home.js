module.exports = function () {
    var express = require('express');
    const pool = require('../modules/dbcon').pool;
    var router = express.Router();

    /* This function extracts the current non-expired listings and renders the home page with the data.*/
    function serveHome(req, res, next) {
        var mainQuery = 'SELECT i.*, a.attachmentID, a.attName, a.attDescr FROM Items i LEFT JOIN Attachments a on a.itemID = i.itemID ORDER BY i.itemID DESC';
        var context = {"home":true};
        
        if (req.isAuthenticated()) {
            context.auth = req.user;
        } 

        pool.query(mainQuery, function(err, rows, fields){
            if(err){
                context.status = err;
            }else{
                
                var items = consolidateAttachment(rows, 12);
                context.items = items;
            }
            //console.log(context);
            res.render('home', context);    

        })
        
    }

    function getuser(req, res){
        var context = {};
        context.auth = "none";
        if (req.isAuthenticated()) {
            context.auth = req.user;
        }  
        res.send(context);
    }

    /* The routes for homepage */
    router.get('/', serveHome);
    router.get('/usr', getuser); 
    return router;
}();


//This function consolidates the attachments into one array
function consolidateAttachment(rows, finalItemCt){
    let itemInArr = 0;
    let final = [];
    for(let row in rows){
        let curIdx = final.findIndex((curId) => curId.Id == rows[row].itemID);
        if(curIdx == -1){
            itemInArr++;
            if(itemInArr > finalItemCt){
                break;
            }
            let item = {
                "Id":rows[row].itemID,
                "UserId":rows[row].userID,
                "CategoryId":rows[row].catID,
                "Title":rows[row].itemName,
                "Descr":rows[row].itemDescription,
                "Price":rows[row].itemPrice.toFixed(2),
                "Phone":rows[row].itemPhone,
                "Address":rows[row].itemAddress,
                "City":rows[row].itemCity,
                "State":rows[row].itemState,
                "ZipCode":rows[row].itemZip,
                "Lat":rows[row].itemLat,
                "Lon":rows[row].itemLong,
                "Attachments":[{
                    "AttachId":rows[row].attachmentID,
                    "AttName":rows[row].attName,
                    "AttLink":rows[row].attDescr
                }],
                "FirstAttLink": (rows[row].attDescr === null)?"./Files/image-unavailable1.png":rows[row].attDescr
            };
            final.push(item);
        }else{
            final[curIdx].Attachments.push({
                "AttachId":rows[row].attachmentID,
                "AttName":rows[row].attName,
                "AttLink":rows[row].attDescr
            })
        }
    }
    return final;
}