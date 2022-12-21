const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { systemPreferences } = require('electron');
const id = "20211846";
const pw = "whgksmf02!";

async function crawler_notice(sel_num){
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

        //특정 수업 공지사항 크롤링

        //sel_num 번째 수업 클릭
        await page.evaluate(() => {document.querySelector(`#mCSB_1_container > li:nth-child(${sel_num}) > a > span.boardTxt`).click();}) 
        //페이지 전환 대기
        await page.waitForNavigation();


        //공지사항 클릭
        await page.evaluate(() => {document.querySelector("#listBox > table > tbody > tr:nth-child(2) > th > a > i").click();})
        //페이지 전환 대기
        await page.waitForNavigation();

        //게시글 불러오기 시작
        var result_con = []
        const content_1 = await page.content();
        const $a = cheerio.load(content_1);
        for(let tNum=1; tNum < 4; tNum++){
            const lists_1 = $a(`div:nth-child(${tNum}) > dl > dt > h4 > a`).text().replaceAll("\t","").replaceAll("\n", " "); //게시글 제목
            const lists_2 = $a(`div:nth-child(${tNum}) > dl > dd.info > ul.fr`).text().replaceAll("\t","").replaceAll("\n", " "); //게시글 상세 정보
            var res_a = "";
            for(let num=1, blank = 0; blank !=2; num++){ //게시글 내용
                var lists_a = `#listBox > div:nth-child(${tNum}) > dl > dd:nth-child(3) > div > p:nth-child(${num})`; 
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
            result_con.push({pNum:tNum, title:lists_1, info:lists_2, con:res_a});
        }

        //메인 화면에서 로그아웃
        await page.evaluate(() => {
        document.querySelector("#header > div.topCover > ul > li:nth-child(3) > dl > dd > a").click();
        })
        
        await page.waitForNavigation();
        await browser.close();
        
        document.getElementById("notice").innerHTML =  result_con;

    }catch(err){
        document.getElementById("notice").innerHTML =  '에러발생\n\n' + err;
    }
}

// crawler();


