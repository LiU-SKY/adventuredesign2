const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { systemPreferences } = require('electron');
const id = "20211846";
const pw = "whgksmf02!";

async function crawler_list(){
    try{
        document.getElementById("output").innerHTML = '';
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto('https://edu.dju.ac.kr/Main.do?cmd=viewHome');
        
        document.getElementById("data").innerHTML = "로그인 중";
        await page.evaluate(({ id,pw }) => {
            document.querySelector("#id").value = id;
            document.querySelector("#pw").value = pw;
            document.querySelector("#loginForm > fieldset > p > a").click();
            
        }, { id,pw } )
        await page.waitForNavigation();
        
        document.getElementById("data").innerHTML = "로그인 완료";
        //로그인 완료

        //수업목록 불러오기 시작
        
        document.getElementById("data").innerHTML = "수업 목록 읽는 중";
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
        //수업목록 불러오기 완료
        
        document.getElementById("data").innerHTML = "수업 목록 읽기 완료";
        for (var i = 0; i < arrRes.length; i++){
            
            var result = ""

            for (var n = 0; n < arrRes[i].length; n++){
                result += arrRes[i][n]
            }
            result += `<br><button onclick="crawler_notice(${i+1});">공지사항 조회</button>
            <button onclick="crawler_data(${i+1});">강의자료실 조회</button>
            <button onclick="crawler_video(${i+1});">강의 영상 조회</button><br><br>`
            document.getElementById("output").innerHTML += result;
        }
        
        document.getElementById("data").innerHTML = "";

        //게시글 화면에서 로그아웃
        await page.evaluate(() => {
        document.querySelector("#loginForm > fieldset > ul.member > li:nth-child(1) > a").click();
        })

        // await page.close();
        
        await page.waitForNavigation();
        await browser.close();
        

    }catch(err){
        document.getElementById("output").innerHTML = '에러발생\n\n' + err;
        await page.evaluate(() => {
            document.querySelector("#loginForm > fieldset > ul.member > li:nth-child(1) > a").click();
            })
    
            // await page.close();
            
            await page.waitForNavigation();
            await browser.close();
    }
}

async function crawler_notice(sel_num){
    try{
        document.getElementById("data").innerHTML = "";
        
        document.getElementById("data").innerHTML = "로그인 중";
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        await page.goto('https://edu.dju.ac.kr/Main.do?cmd=viewHome');

        await page.evaluate(({ id,pw }) => {
            document.querySelector("#id").value = id;
            document.querySelector("#pw").value = pw;
            document.querySelector("#loginForm > fieldset > p > a").click();
            
        }, { id,pw } )
        await page.waitForNavigation();
        
        document.getElementById("data").innerHTML = "로그인 완료";
        //로그인 완료

        //특정 수업 공지사항 크롤링
        
        document.getElementById("data").innerHTML = "수업 조회 중";
        //sel_num 번째 수업 클릭
        await page.evaluate(({sel_num}) => {document.querySelector(`#mCSB_1_container > li:nth-child(${sel_num}) > a > span.boardTxt`).click();}, {sel_num});
        //페이지 전환 대기
        await page.waitForNavigation();

        
        document.getElementById("data").innerHTML = "해당 수업 공지사항 조회 중";
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
                    res_a += "<br>";
                    blank=1;
                }
                else if(blank == 1 && lists_a == ""){
                    blank=2;
                }
                else{
                    res_a += lists_a + "<br>";
                    blank=0;
                }
            }//결과값 res_a
            result_con.push({'pNum':tNum, 'title':lists_1, 'info':lists_2, 'con':res_a});
        }

        //메인 화면에서 로그아웃
        await page.evaluate(() => {
        document.querySelector("#header > div.topCover > ul > li:nth-child(3) > dl > dd > a").click();
        })
        
        await page.waitForNavigation();
        
        document.getElementById("data").innerHTML = "";
        await browser.close();
        for (var i = 0; i < result_con.length; i++) {
            var res_aa = `${result_con[i]['pNum']}) ${result_con[i]['title']}<br>${result_con[i]['info']}<br>${result_con[i]['con']}<br>`
            document.getElementById("data").innerHTML += res_aa;
        }

    }catch(err){
        document.getElementById("data").innerHTML =  '에러발생\n\n' + err;
        await page.evaluate(() => {
        document.querySelector("#header > div.topCover > ul > li:nth-child(3) > dl > dd > a").click();
        })
        
        await page.waitForNavigation();
        await browser.close();
    }
}

async function crawler_data(sel_num){
    try{
        document.getElementById("data").innerHTML = "강의 자료실 조회 시작";
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        await page.goto('https://edu.dju.ac.kr/Main.do?cmd=viewHome');

        
        document.getElementById("data").innerHTML = "로그인 중";
        await page.evaluate(({ id,pw }) => {
            document.querySelector("#id").value = id;
            document.querySelector("#pw").value = pw;
            document.querySelector("#loginForm > fieldset > p > a").click();
            
        }, { id,pw } )
        await page.waitForNavigation();
        //로그인 완료

        //첫번째 수업 공지사항 크롤링
        
        document.getElementById("data").innerHTML = "수업 조회 중";
        //첫번째 수업 클릭
        await page.evaluate(({sel_num}) => {document.querySelector(`#mCSB_1_container > li:nth-child(${sel_num}) > a > span.boardTxt`).click();}, {sel_num}) 
        //페이지 전환 대기
        await page.waitForNavigation();

        
        document.getElementById("data").innerHTML = "강의자료실 조회 중";
        //학습자료실 클릭
        const content_0 = await page.content();
        const $c = cheerio.load(content_0);
        if($c("#listBox > table > tbody > tr:nth-child(4) > th > span").text() == '강의자료실'){
            await page.evaluate(() => {document.querySelector("#listBox > table > tbody > tr:nth-child(4) > th > a > i").click();})
        }
        else{
            await page.evaluate(() => {document.querySelector("#listBox > table > tbody > tr:nth-child(5) > th > a > i").click();})
        }

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
            result_con.push({'pNum':tNum, 'title':lists_1, 'info':lists_2,'file':lists_file, 'con':res_a});
        }

        //게시글 화면에서 로그아웃
        await page.evaluate(() => {
        document.querySelector("#header > div.topCover > ul > li:nth-child(3) > dl > dd > a").click();
        })
        
        await page.waitForNavigation();
        await browser.close();
        document.getElementById("data").innerHTML = '';
        for (var i = 0; i < result_con.length; i++) {
            var res_aa = `${result_con[i]['pNum']}) ${result_con[i]['title']}<br>${result_con[i]['info']}<br>${result_con[i]['file']}<br>${result_con[i]['con']}<br>`
            document.getElementById("data").innerHTML += res_aa+'<br>';
        }
        

    }catch(err){
        document.getElementById("data").innerHTML = '에러발생\n\n' + err;
    }
}

async function crawler_video(sel_num){ //들어야할 강의가 있는지 체크
    try{
        document.getElementById("data").innerHTML = "강의 영상 조회 시작";
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        await page.goto('https://edu.dju.ac.kr/Main.do?cmd=viewHome');
        document.getElementById("data").innerHTML = "로그인 중";
        await page.evaluate(({ id,pw }) => {
            document.querySelector("#id").value = id;
            document.querySelector("#pw").value = pw;
            document.querySelector("#loginForm > fieldset > p > a").click();
            
        }, { id,pw } )
        await page.waitForNavigation();
        //로그인 완료

        //첫번째 수업 공지사항 크롤링
        
        document.getElementById("data").innerHTML = "수업 조회 중";
        //첫번째 수업 클릭
        await page.evaluate(({sel_num}) => {document.querySelector(`#mCSB_1_container > li:nth-child(${sel_num}) > a > span.boardTxt`).click();}, {sel_num});
        
        //페이지 전환 대기
        await page.waitForNavigation();
        
        document.getElementById("data").innerHTML = "수업 영상 조회중";
        //수업목록 불러오기 시작
        const content_1 = await page.content();
        const $a = cheerio.load(content_1);
        
        const lists_1 = $a(`#listBox > table > tbody > tr:nth-child(1) > td:nth-child(6)`).text()
        .replaceAll("\t","").replaceAll("\n","").replaceAll("복습 하기","").replaceAll("강의 후기 (0)","").split("      ");

        const lists_2 = $a(`#listBox > table > tbody > tr:nth-child(1) > td:nth-child(7)`).text()
        .replaceAll("\t","").replaceAll("\n","").replaceAll("복습 하기","").replaceAll("강의 후기 (0)","").split("      ");
        //console.log(lists_1, lists_2);
        var res = [lists_1, lists_2];

        //수업목록 화면에서 로그아웃
        await page.evaluate(() => {
        document.querySelector("#header > div.topCover > ul > li:nth-child(3) > dl > dd > a").click();
        })
        


        await page.waitForNavigation();
        await browser.close();
        
        document.getElementById("data").innerHTML = "";
        for (var i = 0; i < res.length; i++) {
            for ( var n = 0; n < res[i].length; n++){
                var res_aa = `${res[i][n]}<br><br>`
                if(res_aa==""){
                    document.getElementById("data").innerHTML = "들어야  할 강의가 없습니다";
                }
                document.getElementById("data").innerHTML += res_aa;
            }
        }
        

    }catch(err){
        document.getElementById("data").innerHTML = '에러발생\n\n' + err;
    }
}
