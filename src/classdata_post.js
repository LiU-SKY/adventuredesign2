const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { systemPreferences } = require('electron');
const id = "20211846";
const pw = "whgksmf02!";

const crawler = async() => {
    try{
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        await page.goto('https://edu.dju.ac.kr/Main.do?cmd=viewHome');

        await page.evaluate(({ id,pw }) => {
            document.querySelector("#id").value = id;
            document.querySelector("#pw").value = pw;
            document.querySelector("#loginForm > fieldset > p > a").click();
            
        }, { id,pw } )
        await page.waitForNavigation();
        //로그인 완료

        //첫번째 수업 공지사항 크롤링

        //첫번째 수업 클릭
        await page.evaluate(() => {document.querySelector("#mCSB_1_container > li:nth-child(1) > a > span.boardTxt").click();}) 
        //페이지 전환 대기
        await page.waitForNavigation();


        //학습자료실 클릭
        await page.evaluate(() => {document.querySelector("#listBox > table > tbody > tr:nth-child(4) > th > a > i").click();})
        //페이지 전환 대기
        await page.waitForNavigation();

        //게시글 불러오기 시작
        var result_con = []
        const content_1 = await page.content();
        const $a = cheerio.load(content_1);
        for(let tNum=1; tNum < 4; tNum++){
            const lists_1 = $a(`#listBox > div:nth-child(${tNum}) > dl > dt > h4 > a`).text().replaceAll("\t","").replaceAll("\n", " "); //게시글 제목
            const lists_file = $a(`#listBox > div:nth-child(${tNum}) > dl > dd.info > ul.fl`)
            .text()
            .replaceAll("	var downArr='';	function fileDownCheck(rfile, sfile, fpath){		if(downArr.indexOf(sfile) > -1){			alert('같은 파일은 중복하여 다운로드 하실 수 없습니다.');		}else{				fileDownload(rfile, sfile, fpath);				downArr += ','+sfile;		}	}", "")
            .replaceAll("\n", " ")//첨부파일 정보
            .replaceAll("\t","")
            .replaceAll("  ", "");
            const lists_2 = $a(`#listBox > div:nth-child(${tNum}) > dl > dd.info > ul.fr`).text().replaceAll("\t","").replaceAll("\n", " "); //게시글 상세 정보
            
            var res_a = "";
            for(let num=1, blank = 0; blank !=2; num++){
                var lists_a = `#listBox > div:nth-child(${tNum}) > dl > dd:nth-child(3) > div > p:nth-child(${num})`; //게시글 내용
                lists_a = $a(lists_a).text();
                if(blank==0 && lists_a == ""){
                    res_a += "\n";
                    blank=1;
                }
                else if(blank == 1 && lists_a == ""){
                    blank=2;
                }
                else{
                    res_a += lists_a + "\n";
                    blank=0;
                }
            }//결과값 res_a
            result_con.push({pNum:tNum, title:lists_1, info:lists_2,file:lists_file, con:res_a});
        }
        console.log(result_con);



        //게시글 화면에서 로그아웃
        await page.evaluate(() => {
        document.querySelector("#header > div.topCover > ul > li:nth-child(3) > dl > dd > a").click();
        })
        
        await page.waitForNavigation();
        await browser.close();

    }catch(err){
        console.log('에러발생')
        console.log(err)
    }
}

crawler();


