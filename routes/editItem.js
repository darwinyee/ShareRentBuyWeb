module.exports = function () {
    const express = require('express');
    const get_set_items = require('../modules/items.js');
    const router = express.Router();
    const fetch = require('node-fetch');
    const mngUsers = require('../modules/users.js');

	/* This function extracts the current non-expired listings and renders the home page with the data.*/
	function renderItems(req, res) {
        console.log(req.user);
        function setItems(data){
            res.render('editItem', {data});
        }
		get_set_items.data.getUsersItems(req.user, setItems) ;
    }

    // Deletes an item by the id and sends the refresh itemlist
    function removeItemAndSendUpdatedList(req, res){

        const pool = require('../modules/dbcon').pool;

        //Check if the item exists in the database
        pool.query('SELECT * FROM Items WHERE itemID=? ', [req.body.id], function(err, rows, fields){
            if(err){
                res.send({"err":err});
            }
            if(rows.length == 1){
                //Remove the item from the database
                pool.query('DELETE FROM Items WHERE itemID = ? ', [req.body.id], function(err, rows){
                    if(err){
                        res.send({"err":err});
                    }
                    //return the refresh itemlist back to caller
                    get_set_items.data.getUsersItems(req.user, (data)=>{res.send({data})});
                });
            }else{
                res.send({"err":"No item found!"});
            }            
        });      
    }
 
    function editEditItem(req, res){

        function sendItem(item){
            res.send(item);
        }
        get_set_items.data.getItem(req.body.id, sendItem) ;
    }

    function getCats(req, res){
        function cats(data){
            res.send(data);
        }
        get_set_items.data.getCategories( cats ) ;
    }

    async function saveItem(req, res){
        if (!req.user) {
            console.log('User not logged in');
            var message = 'User not logged in';
            res.redirect('/login', message);
        } else {
            var saveItem = {
                itemID: req.body.itemID,
                catID: req.body.catID,
                itemName: req.body.itemName,
                itemDescription: req.body.itemDescription,
                itemPrice: req.body.itemPrice,
                itemAddress: req.body.itemAddress,
                itemCity: req.body.itemCity,
                itemState: req.body.itemState,
                itemZip: req.body.itemZip,
                itemPhone: req.body.itemPhone,
                sellType: req.body.sellType
            }

            var addressString = req.body.itemAddress + ', ' + req.body.itemCity + ', ' + req.body.itemState;
            addressString = addressString.replace(/\s/g, '+');
            
            await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${addressString}&key=${process.env.GOOGLE_API_KEY}`)
                .then((data) => {
                    return data.json();
                })
                .then((data) => {
                    lat = data.results[0].geometry.location.lat;
                    long = data.results[0].geometry.location.lng;
                })
                .catch((err) => res.status(500).send({ error: { err } }));
            try {
                saveItem.lat = lat;
                saveItem.long = long;
                get_set_items.data.saveItem(saveItem, () => {

                    res.send("Item saved!");
                    
                });
            } catch (err) {
                res.status(500).send({ error: err });
            }
        }
    }

    router.delete('/', mngUsers.data.checkAuthenticated, removeItemAndSendUpdatedList);
    router.post('/id', mngUsers.data.checkAuthenticated, editEditItem);
    router.post('/save', mngUsers.data.checkAuthenticated, saveItem);
    router.get('/cats', getCats);
    router.get('/', mngUsers.data.checkAuthenticated, renderItems);
    
	return router;
}();