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

        //수업목록 불러오기 시작
        const content = await page.content();
        const $ = cheerio.load(content);
        const lists = $("#mainContent > div.center_box > div > ul");
        
        var result = lists.text().replaceAll('\t', '').replaceAll(' ', '').split('\n');
        let res = result.filter((element) => {
            return element !== undefined && element !== null && element !== '';
          });

        var arr = [];
        var arrRes = [];
        for (let i = 0, n = 0; i < res.length; i++, n++){
            if(n==3){
                arr = [];
                n=0;
            }
            arr.push(res[i]);
            if(n==2){
                arrRes.push(arr);
            }
        }
        
        console.log(arrRes);
        //수업목록 불러오기 완료

        //게시글 화면에서 로그아웃
        await page.evaluate(() => {
        document.querySelector("#loginForm > fieldset > ul.member > li:nth-child(1) > a").click();
        })

        // await page.close();
        
        await page.waitForNavigation();
        await browser.close();

    }catch(err){
        console.log('에러발생')
        console.log(err)
    }
}

crawler();


