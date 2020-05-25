const linebot = require('linebot');
const express = require('express');
const app = express();
const rp = require('request-promise');
const bodyParser = require('body-parser');
const fs = require('fs');
const Jimp = require("jimp")
const SITE_NAME = '大里';
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const passcode = 'qwerasdf';
/*const group = ['U28ad9c6974cb6766a2164aa94a45a8c4',
				 'U1e496f38f321ddd4f10230939bf37de8',
				 'Uaf9d395e8ecad0655f44d78c598b4a51'
				
				];*/
const group=[];
const photo=[];


const aqiOpt = {
    uri: "http://opendata2.epa.gov.tw/AQI.json",
    json: true
}; 

const bot = linebot({
	channelId:'1622891277',
	channelSecret:'176aab9238f5a7520a4012b5adcd559c',
	channelAccessToken:'6PCep/RljH669wC66EpdjE2v0NNl/kmov9YQty88R+fDeOX+1kbVIPGsAS/krtMwiWBIl57dve7Nif5EOTShezbsFUVCQzcROC/OUJOspDp1KLVcpQN0UpMM0qSiSMMbXzuXF8GVeceCkrukMAVSHAdB04t89/1O/w1cDnyilFU='
});


function readAQI(repos){
    let data;
    
    for (i in repos) {
        if (repos[i].SiteName == SITE_NAME) {
            data = repos[i];
            break;
        }
    }
 
    return data;
}

const linebotParser = bot.parser();


app.get('/',function(req,res){
     rp(aqiOpt)
    .then(function (repos) {
        res.render('index', {AQI:readAQI(repos)});
    })
    .catch(function (err) {
		res.send("無法取得空氣品質資料～");
    });
});


app.get('/a', function(req, res) {
  res.sendFile(__dirname + '/www/index.html')
});

app.post('/regist',function(req,res){
  var user=req.body.user;
  var email=req.body.email;
  var boards = req.body.boards;

  var html = '暱稱：' + user + '<br>' +
             '電郵：' + email + '<br>' +
             '控制板：' + boards.toString();

  res.send(html);
});

app.post('/public/back', upload.array('file', 12), function (req, res, next) {
    console.log(req.files)
    res.send("done");
});

var temp ='sensor未連接';
var humid='sensor未連接';

app.get("/th", function a(req, res) {  
	temp = req.query.t;   // 讀取查詢字串的t值
	humid = req.query.h;  // 讀取查詢字串的h值

  // 確認有收到溫度和濕度值（兩者都不是undefined）
  if (temp != undefined && humid != undefined) {
　　console.log("溫度: " + temp + "，濕度： " + humid);
　　res.send("溫度: " + temp + "°C，濕度： " + humid +"%");
	/*setTimeout(function(){temp ='sensor未連接';},20000);
	setTimeout(function(){humid='sensor未連接';},20100);*/
  } else {
  	console.log("沒收到資料！");
  }
  return temp;
  return humid;
});

var water1 ='sensor未連接';
var humid1='sensor未連接';

app.get("/sonar", function a(req, res) {  
	water1 = req.query.w;   
	humid1 = req.query.h; 

  if (temp != undefined && humid != undefined) {
　　console.log("溫度: " + water1 + "，濕度： " + humid1);
　　res.send("溫度: " + water1 + "°C，濕度： " + humid1 +"%");
	/*setTimeout(function(){water1 ='sensor未連接';},20000);
	setTimeout(function(){humid1='sensor未連接';},20100);*/
  } else {
  	console.log("沒收到資料！");
  }
  return water1;
  return humid1;

});


app.get('/farm', function(req, res) {
	if (req.query.key !== passcode) {
		res.status(401).send('ERROR!');
	}
 
	let id = req.query.id;
	res.send("id: " + id);
 
	switch (id) {
		case 'water_flower':
			bot.multicast(group, {
				type: 'text',
				text: '澆花囉~~~~~'
			});
			break;
		
	}
 
});

app.get("/sonar1", function (req, res) {  
	var water = req.query.a;  
	res.send(water);	
	switch(water){
		case'1':
			bot.multicast(group, {
				type: 'text',
				text: '要澆花囉~~~!!'
			});
		break;
		}
});

app.get("/face", function a(req, res) {
    var imgur = req.query.i;	
	var who = req.query.w;   
	var photocb = req.query.p;
	
	res.send(imgur);
	
	switch(who){
		case'1':
			bot.multicast(group, {
				type: 'text',
				text: '有人回家囉!!'
			});
			bot.multicast(group, {
				type: 'image',
				originalContentUrl: 'https://i.imgur.com/' + imgur+'.jpg',
				previewImageUrl: 'https://i.imgur.com/' + imgur+'.jpg'
			});
			
		break;
		
		case'2':
			bot.multicast(group, {
				type: 'text',
				text: '注意~有不明人士在家門前!!'
			});
			bot.multicast(group, {
				type: 'image',
				originalContentUrl: 'https://i.imgur.com/' + imgur+'.jpg',
				previewImageUrl: 'https://i.imgur.com/' + imgur+'.jpg'
			});
			
		break;
		
		case'3':
			bot.multicast(group, {
				type: 'text',
				text: '注意~門沒有確實關上!!'
			});
		break;
		
	}
});

var phototemplate={
    type: 'template',
    altText: 'this is a confirm template',
    template: {
        type: 'buttons',
        text: '臉部新增與修改!',
        actions: [{
            type: 'postback',
            label: '查看是否註冊面孔',
            data: '1'
        }, {
            type: 'postback',
            label: '新增面孔',
            data: '2'
        }, {
            type: 'postback',
            label: '刪除面孔',
            data: '3'
        }
	]}
    };


bot.on('postback', function (event) {
   var myResult1=setphoto(event.postback.data);
   if (myResult1 == '已有註冊面孔!'){
		event.reply([
			{
				type:'text',text:'已有註冊面孔\n圖如下!'
			},
			{
				type: 'image',
				originalContentUrl: 'https://aifarmhouse.herokuapp.com/imgs/' + mytempleteid+'.png',
				previewImageUrl: 'https://aifarmhouse.herokuapp.com/imgs/hello1.png'
			}						
      ]);
   }
   else {
	   event.reply(myResult1).then(function(data) {
         // success 
         console.log('訊息已傳送！');
      }).catch(function(error) {
         // error 
         console.log('error');
      }); 
   }
 
});

var myResult=setphoto();

function setphoto(fromMsg){
   var returnResult='';
   var findmyid = group.indexOf(myId);
	if (findmyid != -1){
	   if (fromMsg=='1'){

			var findphotoid = photo.indexOf(photoidid);
			if (findphotoid != -1){
					returnResult='已有註冊面孔!';
				}
				else{
					returnResult='尚未註冊面孔!';;
				}
		   
	   }
	   else if (fromMsg=='2'){
		   var findphotoid1 = photo.indexOf(photoidid);
		   if (findphotoid1 == -1){
			returnResult='請在15秒內上傳您的照片';
			openimage = '1';
			setTimeout(function(){openimage = '0';},15000);
			setTimeout(function(){bot.push(mytempleteid, {
							type: 'text',
							text: '時間到!'
						});},15100); 
		   }else{
			   returnResult='請先刪除面孔!';
		   }
			
	   }
	   else if (fromMsg=='3'){
		    var findphotoid2 = photo.indexOf(photoidid);
			if(findphotoid2 != -1){
				fs.unlink('./public/imgs/'+mytempleteid+'.jpg', function () {
						console.log('已經刪除jpg檔!');
					});
				fs.unlink('./public/imgs/'+mytempleteid+'.png', function () {
						console.log('已經刪除png檔!');
					});
								
				var findid = photo.indexOf(photoidid);
					if (findid>-1){
						photo.splice(findid,1);
					}
				openphotoid = '2';
				returnResult='已刪除照片';
			}
			else{
				returnResult='請先新增圖片!!';
			}
	   }
	   
	}
	else{
		returnResult='請先登入!!';
	}
   return returnResult;
}

app.post('/linewebhook', linebotParser);
var msg;
var msg1;
var msg2;
var sssssssssssssssssssssss;
var myId;
var mytempleteid;
var delphotoidid;
var openphotoid = '0';
var photoidid = '0';
var openimage = '0';
var replytimeout = '0';

bot.on('message', function (event) {
	
				
	switch (event.message.type) {
		case 'text':
			var anytext = event.message.text;
			myId=event.source.userId;
			var findmyid = group.indexOf(myId);
			
			if (findmyid != -1){
			
				switch (event.message.text) 
				{
					case '空氣':
						let data;
						rp(aqiOpt)
						.then(function (repos) {
							data = readAQI(repos);
							event.reply(data.County + data.SiteName +
							'\n\nPM2.5指數：'+ data["PM2.5_AVG"] + 
							'\n狀態：' + data.Status);
						})
						.catch(function (err) {
							event.reply('無法取得空氣品質資料～');
						});
					break;
					
					case 'Face':
						mytempleteid = event.source.userId;
						event.reply(phototemplate);
						myResult=phototemplate;
						
					break;
					
					case '溫溼度':
						event.reply('溫度: ' + temp + '°C，濕度： ' + humid +'%');
					break;
					
					case '澆花':
						event.reply('水塔水位: ' + water1 + '，土壤濕度： ' + humid1);
					break;
					
					case '開門':
						msg2 = 'true';
						event.reply('已將家門開啟~~');
						setTimeout(function(){msg2='0';},5000);
					break;
										
					case '開電':
						msg1 = 'true';
						event.reply('已將家電開啟~~');				
					break;
					case '關電':
						msg1 = 'false';	
						event.reply('已將家電關閉~~');						
					break;

					case '123':
					var userid=event.source.userId;
						event.reply([
                                    {
                                        "type": "image",
                                        "originalContentUrl": "https://i.imgur.com/" + who,
                                        "previewImageUrl": "https://i.imgur.com/" + who
                                    }								
                                ]);				
					break;
					
					
					
					case 'logout':
						
							event.source.profile().then(function(profile) {
							let id1 = profile.userId;
							var findid = group.indexOf(id1);
							if (findid>-1){
								group.splice(findid,1);
							}
							event.reply('已成功登出!\n'+profile.userId);
							});
					
					break;
					
					case '?':
						
							event.reply(
									'AI Door House使用說明~'+
									'\n1.若要登出此BOT請手動打「logout」!\n'+
									'\n2.圖文選單說明'+
									'\n「Face」管理臉部辨識之新增、刪除、查看面孔功能'+
									'\n\n「Door」開門'+
									'\n\n「溫溼度」查看家中溫濕度'+
									'\n\n「澆花」澆花喔'+
									'\n\n「開電」強制開啟家中所有家電'+
									'\n\n「關電」強制關閉家中所有家電'+
									'\n\n3.登入此BOT將會收到所有推播訊息喔!!');
					
					break;
					
					case'查看是否登入':
							event.source.profile().then(function(profile) {
							let id2 = profile.userId;
							var findid2 = photo.indexOf(id2);
							if (findid2 != -1){
								event.reply('是');
							}
							else{
								event.reply('否');
							}
							});	
					break;
				}}
				else{
					if(anytext == 'loginbot'){
						event.source.profile().then(function(profile) {
						event.reply('已成功登入!\n'+profile.userId+
									'\n\n若要查看說明，請輸入「?」');
						let id = profile.userId;
						console.log('IIIDDD--->'+id);
						group.push(id);
						});
					}
					else{
						event.reply('請輸入密碼~~!!');
					}
					
				}
				
		break;
		

		case 'sticker':
			event.reply(
					{
					type: 'sticker',
					packageId: 1,
					stickerId: 1
					}
				);
		break;
		
		
		case 'image':
			if(openimage == '1'){
				//如果使用者上傳訊息的型態是圖片
					event.message.content().then(function (content) {					
						//以base64編碼字串取回圖片
						var data = content.toString('base64');
							
						//將字串轉回圖片資料
						var buf = Buffer.from(data, 'base64');
						
						var userid=event.source.userId;
											
						fs.writeFile('./public/imgs/' + userid + '.png', buf, (err) => {
							console.log('The png has been saved!');
						});
						
						setTimeout(function(){
							
							Jimp.read('./public/imgs/' + userid + '.png', function (err, image) {
							  if (err) {
								console.log(err);
							  } else {
								image.write('./public/imgs/' + userid + '.jpg');
								event.reply([
                                    {
                                        type: 'image',
                                        originalContentUrl: 'https://aifarmhouse.herokuapp.com/imgs/' + userid+'.png',
                                        previewImageUrl: 'https://aifarmhouse.herokuapp.com/imgs/hello1.png'
                                    },
									{
										type:'text',text:'已成功新增面孔!'
									}
									
                                ]);
								photoidid=event.source.userId;
								photo.push(photoidid);
								openphotoid = '1';
								
								console.log('The jpg has been saved!哈哈');					
							  }
							})
							
						},3000);				
						
					});
				
		}
		else{
			event.reply('哈囉~~若要新增面孔的話\n請先按「Face」按鈕喔!');
		}
		
		break;
		
		default:
			event.reply('Unknow message: ' + JSON.stringify(event));
			break;
		
	}
	
	
	
	
});

app.get('/watering', function(req, res) {
	res.send(msg);
	
});

app.get('/door', function(req, res) {
	res.send(msg2);
});

app.get('/dlib', function(req, res) {
	msg2 ='true';
	res.send(msg2);
	setTimeout(function(){msg2='0';},5000);
});

app.get('/appliance', function(req, res) {
	res.send(msg1);
});

app.get('/photoid', function(req, res) {
	if(openphotoid == '1'){
	res.send(photoidid);
	}
	else if (openphotoid == '2'){
	res.send('delete'+photoidid);
	}
	else{
	res.send('0');
	}
});

app.get('*', function(req, res) {
	res.status(404).send('找不到網頁！');
});

app.listen(process.env.PORT || 80, function () {
	console.log('LineBot is running.');
});