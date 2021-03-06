/* 
 * Author: Lucas Tolliver/ Sean
 * Credit: Starter code from CS340-Sample-Web-App by wolfordj
 */

module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /* 
        ====================SELECT===================== 
        =============================================== 
    */
    /* Selector for All albums */ 
    function getAlbums(res,mysql,context,complete){
        mysql.pool.query("SELECT albumID, albumTitle FROM album",function(error,results,fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.albums = results;
            complete(); 
        });
    }
    

    /* Selector for All songs */ 
    function getSongs(res,mysql,context,complete){
        mysql.pool.query("SELECT songID, songTitle, album.albumTitle AS alID, runTime, writingCredit FROM song INNER JOIN album ON alID = album.albumID",function(error,results,fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.song = results;
            complete(); 
        });
    }

    /* Selector for one song */
    function getSong(res, mysql, context, songID, complete){
        var sql = "SELECT songID, songTitle, alID, runTime, writingCredit FROM song WHERE songID = ?";
        var inserts = [songID];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.song = results[0];
            complete();
        });
    }
    
    /* Selector for search */
    function getSongWithName(req,res,mysql,context,complete){
        var query = "SELECT songID, songTitle, album.albumID as alID, runTime, writingCredit FROM song INNER JOIN album ON alID = album.albumID WHERE song.songTitle LIKE " + mysql.pool.escape(req.params.s);
        console.log(query)
        
        mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.song = results;
            complete();
            
        });
    }
    /* 
        ====================DISPLAY==================== 
        =============================================== 
    */

    /* Route to display all songs */ 
    router.get('/',function(req,res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletesong.js"];
        var mysql = req.app.get('mysql');
        getSongs(res,mysql,context,complete);
        getAlbums(res,mysql,context,complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('songsPage',context);
            }
        }
    });


    /* Route to display one song */
    router.get('/:songID', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["updatesong.js"];
        var mysql = req.app.get('mysql');
        getSong(res, mysql, context, req.params.songID, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-song',context);
            }
        }
    });
    
    /* 
        ====================UPDATE===================== 
        =============================================== 
    */

    /* Route to add an song */
    router.post('/', function(req,res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO song (songTitle, runTime, writingCredit, alID) VALUES (?,?,?,?)";
        var inserts = [req.body.songTitle, req.body.runTime, req.body.writingCredit, req.body.alID];
        sql  = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/songs');
            }
        });
    });


    /* Route to update an song */
    router.put('/:songID', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE song SET songTitle=?, runTime=?, writingCredit=? WHERE songID=?";
        var inserts = [req.body.songTitle, req.body.runTime, req.body.writingCredit, req.params.songID];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                console.log(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });


    /* Route to delete an song */
    router.delete('/:songID', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM song WHERE songID = ?";
        var inserts = [req.params.songID];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                console.log(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        });
    });
    
    /* route to get a song by name */
    router.get('/search/:s', function(req,res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["updatesong.js","deletesong.js","searchSong.js"];
        var mysql = req.app.get('mysql');
        getSongWithName(req,res,mysql,context,complete);
        getAlbums(res,mysql,context,complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('songsPage', context);
            }
        }
    });


    return router;
}();