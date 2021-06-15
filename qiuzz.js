

// 전체 문제 수, 랜덤숫자, 문제번호, 초성개수
var total;
var num, cur, items;  

// 랜덤으로 저장되는 문제 리스트
var rand_quiz={
    quiz:[],
    img:[]
};   

// 푼 문제
var solve_quiz={    
    idx:[],
    result:[]
};  

$(window).on('load', function () {
    // 문제만들기
    makeQuiz();
    
    // total만큼 페이지 생성
    pageCon = new pageContents(total, $('.contents'));
    pageCon.init();
    
    // 문제 세팅
    setQuiz(0);
    
    // 타이머 생성
    setTime(timerCount, $('.timeWrap'));
    
});

// next, prev, dot 클릭
$(document).on('click', '.nav_btn', function(){
    var btn = $(this).attr('class');
    var idx = checkPage();
    
    input = false;
    
    if($('.objWrap .obj').length != 0){
        $('.objWrap .obj').remove();
    }
    
    // 문제 세팅하기
    setQuiz(idx);
    
    $('.btnCheck').removeClass('on');
    
    // 풀었던 문제인지 확인
    checkSolvedQuiz();

})

// 버튼클릭
$(document).on('click', '.btn', function(){
    var btn = $(this).attr('class');
    var idx = checkPage();
    input = false;
    
    // 정답확인 
    if(btn.indexOf('btnCheck')>-1){ 
        if($(this).hasClass('on')){ // 정답확인 재클릭(현재는 작동하지 않는 기능)
            $('.textarea').each(function(index){
                $(this).val(rand_quiz[idx].split('')[index]);
                $(this).attr('disabled',false);
            })
            for(i in non_index[idx]){
                if(non_index[idx].split('')[i] != '0'){
                    $('.obj').eq(Number(non_index[idx].split('')[i])-1).find('.textarea').attr('disabled',true);
                }
            }
            
            $('.obj').removeClass('on');
            $(this).removeClass('on');
            
        }else{  // 정답확인
            
            
            // 정답확인 눌렸음, 클릭 비활성화 클래스 'on'추가
            $(this).addClass('on');
            
            // 정답 보여주기
            $('.textarea').each(function(index){
                $(this).val(rand_quiz.quiz[idx].split('')[index]);
                $(this).attr('disabled',true);
            })
            
            // 오답처리
            $('.obj').addClass('onWrong');
            
            // 해당 문제의 index를 solve_quiz에 추가하여 푼 문제로 처리함
            solve_quiz.idx[idx] = true;
            solve_quiz.result[idx] = 'onWrong';
            
            clearInterval(timer2);
            clearInterval(timer3);
            $('.queImgMaskWrap .queMask').addClass('on');
            
            // 모든 문제 풀었는지 체크
            checkSolveAll();
        }
        
    }else if(btn.indexOf('btnNext')>-1){    // 다음문제 버튼
        // 마지막 페이지가 아닌 경우에만 클릭 가능하도록
        if(pageCon.currenPage<total-1){
            $('.navWrap .nav_next').trigger('click');
        }
        
    }else if(btn.indexOf('btnReplay')>-1){  // 다시하기 버튼
        // 다시 랜덤 문제 생성
        makeQuiz();

        // 타이머 초기화 및 타이머 다시 시작
        clearInterval(timer1);
        setTime(timerCount, $('.timeWrap'));
        
        // 첫 번째 페이지로 돌아감
        $('.dotWrap .dot').eq(0).trigger('click');
        $('.btnResult').hide();

    }
})

// 텍스트 입력완료
$(document).on('keyup', '.textarea', function(){
    $(this).val($(this).val().substring(0,1));
    var value  = $(this).val();
    var inputText = '';
    var idx = checkPage();  // 현재 페이지 체크
    
    // 텍스트가 입력된 경우
    if(value.length != 0){
        input = true;
        
    }else{  // 텍스트가 입력되지 않은 경우
        input = false;
    }
    
    // 텍스트가 입력된 경우
    if(input){
        // 입력된 텍스트 문자열로 만들기
        $('.obj .textarea').each(function(){
            inputText += $(this).val();
        })
        
        // 입력된 텍스트와 해당 퀴즈의 정답과 같으면
        // 자동으로 정답처리
        if(inputText == rand_quiz.quiz[idx]){
            clearInterval(timer2);
            clearInterval(timer3);
            $('.queImgMaskWrap .queMask').addClass('on');
            
            $(this).blur();
            $('.obj .textarea').attr('disabled',true);
            $('.obj').addClass('onCorrect');
            $('.btnCheck').addClass('on');
            
            // 푼 문제 리스트에 문제 index 추가
            solve_quiz.idx[idx] = true;
            solve_quiz.result[idx] = 'onCorrect';
        }
        
        // 모든 문제 풀었는지 체크
        checkSolveAll();
    }
})

// enter키 눌렀을 때 페이지만 변경
// 대교 해브펀 script에서 일부 가져옴
$(document).on('keyup', function(e){
    e.preventDefault();
    e = e || window.event;
    
    var knKeyCode = (e.which) ? e.which : e.keyCode;
    
    if (knKeyCode === 13) {
        var idx = checkPage();
        
        if(idx != total){
            $('.btnNext').trigger('click');
        }
    }
    return false;
})



// 수학 common.js에서 가져옴
function removeMask() {
	$('.mask').remove();
}

// 수학 common.js에서 가져옴
function makeMask() {
	$('.contents').append('<div class="mask"></div>');
	$('.contents .mask').css({
		'width': '900px',
		'height': '556px',
		'background-color': 'rgba(0,0,0,0.5)'
	});
}

// 풀었던 문제인지 확인
function checkSolvedQuiz(){
    idx = checkPage();
    
    if(solve_quiz.idx[idx]){
        clearInterval(timer2);
        clearInterval(timer3);
        
        $('.queImgMaskWrap .queMask').addClass('on');
        $('.btnCheck').addClass('on');
        $('.objWrap .obj').addClass(solve_quiz.result[idx]);

        $('.objWrap .obj').each(function(index){
            $(this).html(rand_quiz.quiz[idx].split('')[index]);
        })
    }
}

// 모든 문제 풀었는지 체크
function checkSolveAll(){
    // 시간내에 모든 문제를 풀었다면
    if($.inArray(false, solve_quiz.idx)==-1){
        clearInterval(timer1);
        clearInterval(timer2);
        clearInterval(timer3);
        $('.btnResult').show();

    }else{
        $('.btnResult').hide();
    }
}


function styleQueMask(row, col, percent, wrap){
    wrap.find('.queMask').remove();
    var size = row*col;
    var html = '';
    var rand_mask = [];
    
    for(i=0; i<size; i++){
        html += '<div class="queMask"></div>';
        rand_mask[i]=i;
    }
    
    wrap.append(html);
    
    $('.queMask').css({
        'width': Number(wrap.css('width').split('px')[0])/row,
        'height': Number(wrap.css('height').split('px')[0])/col,
    })

    
    for(i = 0; i<rand_mask.length; i++){
        $('.queMask').eq(rand_mask[i]).addClass('on');
    }
    
}

function makeQueMask(){
    if(timer2 != null){
        clearInterval(timer2);
    }
    
    var queImgMaskWrap = $('.queImgMaskWrap');
    
    var arr_size={'row':2, 'col':2}
    
    var count = 0;
    
    var queMask = queImgMaskWrap.find('.queMask');
    
    var percent = 0.5;
    styleQueMask(arr_size.row, arr_size.col, percent, queImgMaskWrap );
    
    timer2 = setInterval(function(){
        if(arr_size.col > arr_size.row){
            arr_size.row+=1;
        }else{
            arr_size.col +=1;
        }
        
        console.log(arr_size);
        
        styleQueMask(arr_size.row, arr_size.col, percent, queImgMaskWrap);
        
        count += 1;
        
        
        if(count> 10){
            clearInterval(timer2);
            clearInterval(timer3);
        }
        
    },2000)
}

// 문제 만들기
function makeQuiz(){
    var array = {
        quiz:['연', '비빔밥', '한복', '태권도', '홍예헌'],
        img:[
        'url(http://drive.google.com/uc?export=view&id=1iDudMBxBc51Ew4aRHB2OOsW99ytK60Is)',
        'url(http://drive.google.com/uc?export=view&id=1MJhrAxCj389ET-jB0x7OWPunA0XpuhDs)',
        'url(http://drive.google.com/uc?export=view&id=1rytPGcewzMmgjfrZ67rKvF5o8JQNmWfF)',
        'url(http://drive.google.com/uc?export=view&id=1ocOY2qOuILBA_cU16R5V0--nUbaScCxx)',
        'url(http://drive.google.com/uc?export=view&id=1U_y1X3gimzqd3TUhZlcfuyuzIVCOVC2e)',
        ]
    }
    
    total = array.quiz.length;
/*     for(i=0; i<total; i++){
        array.img.push('halfQuiz_'+array.quiz[i]+'.png');
    } */
    
    var randQuiz = {
        quiz:[],
        img:[]
    } ;
    
    // 랜덤으로 저장되는 문제 리스트 생성
    for(i=total; i>0; i--){
        // 1~total 사이의 랜덤 수 발생
        num = Math.random();
        cur = Math.floor(num*(i));
        
        randQuiz.quiz.push(array.quiz[cur]);
        randQuiz.img.push(array.img[cur]);
        
        array.quiz.splice(cur,1);
        array.img.splice(cur,1);
    }
    
    rand_quiz = randQuiz;
    
    // 푼 문제 리스트 
    // total크기만큼 false로 초기화
    solve_quiz.idx.length = total;
    solve_quiz.result.length = total;
    
    solve_quiz.idx.fill(false);
    solve_quiz.result.fill(false);
    
}

// 현재 페이지와 동일한 번호의 문제 보여주기
function setQuiz(idx){
    quiz = rand_quiz.quiz[idx].split('');
    items = quiz.length;
    
    makeObj(items, $('.objWrap'));
    
    $('.queImg').css({
        'background':rand_quiz.img[idx],
        'background-size':'contain'
    })
    
    
    makeQueMask();
    
    
//	$('.textarea').each(function(index){
//        $(this).val(rand_quiz[idx].split('')[index]);
//    })
   
}

// 단어 카드 만들기
function makeObj(num, wrap){
    var html = '';
    var obj = '';
    var w_obj, h_obj;
    
    for(i=0; i<num; i++){
        html += '<div class="obj obj'+(i+1)+'"><input type="text" class="textarea"></div>';
    }
    
    wrap.append(html);
    obj = wrap.find('.obj');
    w_obj = Number(obj.css('width').split('px')[0]);
    h_obj = Number(obj.css('height').split('px')[0]);
    
    wrap.css({
        'width': (w_obj*num)+(50*(num-1)),
        'height': h_obj
    })
    
    obj.each(function(index){
        if(index>0){
            $(this).css({
                'left': (w_obj*index) +(10*index)
            })
        }
    })
    
}

// 현재 페이지 번호 체크
function checkPage(){
    var currentPage =  pageCon.currenPage;

    if(currentPage == (total-1)){
        $('.btnNext').hide();
    }else{
        $('.btnNext').show();
    }
    
    return currentPage;
}


// 페이징
var pageContents = function(num, wrap){
    var self = this;
    this.num = num;
    this.wrap = wrap;
    
    this.navWrap = '';
    this.nav_btn = '';
    this.dotWrap = '';
    
    this.dot= '';
    this.prev= '';
    this.next= '';
    this.currenPage = 0;
    
    this.init = function(){

        this.makeNavi();
        this.makeDot();
        this.styleNavi();
        
        this.pageMove(self.currenPage);
        
        self.prev.on('click', function(){
            self.prevClick($(this));
        })
        
        self.next.on('click', function(){
            self.nextClick($(this));
        })
        
        self.dot.on('click', function(){
            self.dotClick($(this));
        })

    }
    
    this.makeNavi = function(){
        var navWrap = '<div class="navWrap">'+
            '<div class="nav_btn nav_prev"></div>'+
            '<div class="nav_btn nav_next"></div>'+
            '<div class="dotWrap"></div>'+
            '</div>';
        
        this.wrap.append(navWrap);
        this.navWrap = this.wrap.find('.navWrap');
        this.dotWrap = this.wrap.find('.dotWrap');
        
        this.prev = this.navWrap.find('.nav_prev');
        this.next = this.navWrap.find('.nav_next');
        
    }
    
    this.makeDot = function(){
        var dot = '';
        
        for(i=0; i<this.num; i++){
            dot += '<div class="nav_btn dot"></div>';
        }
        
        this.dotWrap.append(dot);
        this.dot = this.dotWrap.find('.dot');
    }
    
    this.styleNavi = function(){
        var w_dot = Number(self.dot.css('width').split('px')[0]);
        var h_dot = Number(self.dot.css('height').split('px')[0]);
        
        self.dotWrap.css({
            'width': (w_dot*num)+(8*(num+1)),
            'height': (h_dot+16)
        })
        
        self.dot.each(function(index){
            $(this).css({
                'left': w_dot*(index)+(8*(index+1))
            })
        })
    }
    
    this.prevClick = function(el){
        if(self.currenPage > 0){
            self.currenPage -= 1;
        }
        this.pageMove(self.currenPage);
    }
    
    this.nextClick = function(el){
        if(self.currenPage < self.num){
            self.currenPage += 1;
        }
        this.pageMove(self.currenPage);
    }
    
    this.dotClick = function(el){
        self.currenPage = el.index();
        this.pageMove(self.currenPage);
    }
    
    this.pageMove = function(pageNum){
        if(pageNum == 0){
            self.prev.hide();
            self.next.show();
            
        }else if(pageNum == (this.num-1)){
            self.prev.show();
            self.next.hide();
            
        }else{
            self.prev.show();
            self.next.show();
        }
        
        self.dot.removeClass('on');
        self.dot.eq(pageNum).addClass('on');
    }
    
    
}