const express = require('express');
const bodyParser = require('body-parser')
const {launch, getStream}  = require("puppeteer-stream")
const {exec} = require("child_process");
const {executablePath} = require('puppeteer')
const expressOasGenerator = require('express-oas-generator')
const app = express();
const PORT = 5000;

app.use(bodyParser.json());
expressOasGenerator.init(app, {});

app.post('/youtube/live', (req, res) => {
	console.log('Post call reached');

	console.log(req.body);
	const youtube = req.body;

	youtube_live_streaming(req, res);

	res.send('Sending stream of data to rtmp server');
})


async function youtube_live_streaming(req, res)
{
	console.log(req.body)

	let jsonBody = req.body;

	if (jsonBody == undefined || Object.keys(jsonBody).length === 0) {
		return res.status(400).send('-----Request body not found------');
	}
    const browser = await launch({headless:true, executablePath: executablePath(), defaultViewport: {
			width: 1366,
			height: 768,
		}});

    //console.log(jsonBody.rtmpUrl);
    //console.log(jsonBody.baUrl);
    //console.log(jsonBody.rtmpKey);
    const page = await browser.newPage(); 

    if (jsonBody.baUrl == undefined || Object.keys(jsonBody.baUrl).length === 0) {
		console.log("@@@@@@@@@@@ NodeServer: missing baURL")
		return res.status(400).send('Missing data : baUrl');
	}
    await page.goto(jsonBody.baUrl, {waitUntil: "load",});

    const stream = await getStream(page, { audio: true, video: true}); 
    console.log("Started Streaming Screen.....")

    if (jsonBody.rtmpUrl == undefined || Object.keys(jsonBody.rtmpUrl).length === 0) {
		console.log("@@@@@@@@@@@ NodeServer: missing rtmpUrl")
		return res.status(400).send('Missing data : rtmpUrl');
	}

	if (jsonBody.rtmpKey == undefined || Object.keys(jsonBody.rtmpKey).length === 0) {
		console.log("@@@@@@@@@@@ NodeServer: missing rtmpKey")
		return res.status(400).send('Missing data : rtmpKey');
	}


	console.log(jsonBody.rtmpUrl)
	console.log(jsonBody.rtmpKey)
    const ffmpeg = exec('ffmpeg -re -i - -vf scale=852:480 -c:v libx264 -pix_fmt yuv420p -profile:v main -preset slow -x264opts "nal-hrd=cbr:no-scenecut" -g 60 -bufsize 3968k -c:a aac -b:a 160k -ac 2 -ar 44100 -filter:v fps=25 -f flv "'+jsonBody.rtmpUrl+jsonBody.rtmpKey+'"');
    //const ffmpeg = exec('ffmpeg -re -i - -vf scale=852:480 -c:v libx264 -pix_fmt yuv420p -profile:v main -preset slow -x264opts "nal-hrd=cbr:no-scenecut" -g 60 -bufsize 3968k -c:a aac -b:a 160k -ac 2 -ar 44100 -filter:v fps=25 -f flv rtmp://a.rtmp.youtube.com/live2/mfa9-tpgh-3jue-g41b-b7uq');
    //console.log(ffmpeg)
    ffmpeg.stderr.on("data", (chunk) => {
            console.log(chunk.toString());
    });

    stream.pipe(ffmpeg.stdin);
}


app.listen(PORT, () => console.log(`Server running on port : http://localhost:${PORT}`));



//Swagger Configuration
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title:'Youtube Live API',
            version:'1.0.0'
        },
    },
    basePath: '/',
    apis:['./app.js']
}


