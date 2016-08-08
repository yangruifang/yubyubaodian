
;(function($){
	var jsonData=null;
	//实现局部滚动效果
	

	init();
	//初始化函数
	function init(){
		var homeIscroll=new iScroll("home",{
			onBeforeScrollStart:function(e){
				var eTarget=e.target.nodeName.toLowerCase();
				//不是input也不是select也不是 button a 
				if(eTarget!="input" && eTarget!="select" && eTarget!="button" && eTarget!="a"){
					e.preventDefault();
				}
			}
		});

		var ls=window.localStorage;
		

		$.ajax({
			url:"data/data.json",
			type:"post",
			dataType:"json",
			async:false,
			success:function(data){
				jsonData=data;
			},
			error:function(){
				alert("请求失败了！")
			}
		})
		addEvent();
		//在本地存储中存储一个空数组将来用于存放收藏的内容
		if(!ls.getItem('fav')){
			ls.setItem("fav","[]");
		}

		showFavorite();
		showHistory();
	}
	function addEvent(){
		$(".container").on("click","a",function(e){
			//取消默认行为
			var event= e || window.event;
			e.preventDefault();
		})
		.on("tap","a",function(){
			//切换页面，让对应的页面进来，其它的页面出去，通过translate实现
			var ye=$(this).attr("href");
			$(ye)
			.css({
				"-webkit-transform":"translate3d(0,0,0)"
			})
			.siblings().css({
				"-webkit-transform":"translate3d(100%,0,0)"
			});

			//导航背景图
			if($(this).parent().is("nav")){
				var idx=$(this).index();
				$("#move").animate({
					"left":idx*25+"%"
				},300);
			}

			//头部的变化
			changeHeader($(this));
			//如果进入的是列表页就渲染数据
			if(ye=="#list"){
				readerChange($(this));
			}else if(ye=="#detail"){
			//如果你进入的是内容页面
				readerDetail($(this));
			}
		})

		//给搜索按钮添加监听事件
		$("#seBtn").on("tap",function(){
			seachContent();
		})

		//收藏
		$("#favbtn").on('tap',function(){
			favorite();
		})

		//历史记录
		$("#history").on("tap",function(){
			showHistory();
		})
	}

	function changeHeader(curText){
		//标题文字发生变化
		//var titTxt=curText.attr("data-tit"),
		var titTxt=curText.data("tit"),
			curHerf=curText.attr("href");
		$("#back").hide();
		$("#search2").show();
		$("#favbtn").hide();
		$(".header").show();
		$("#search1").hide();

		$("#title").text(titTxt);

		if(curHerf=="#list"){//进入列表页
			$("#back")
			.show()
			.attr({
				"href":"#home",
				"data-tit":"孕育宝典"
			});
		}else if(curHerf=="#detail"){//进入详细页
			var _key=curText.data("source").split("_")[0],
			from=curText.data("from");
			if(from=='list'){
				$('#back').attr('href',"#list");
			}else if(from=="searchf"){
				$("#back").attr("href","#searchf");
			}
			$("#back")
			.show()
			.attr({
				"href":"#"+from,
				"data-tit":jsonData[_key].home_title,
				"data-id":_key
			});
			$("#search2").hide();
			$("#favbtn").show();
		}else if(curHerf=="#searchf"){

			$("#header").hide();
			$("#search1").show();
		}
	}

	//获取列表数据
	function readerChange(that){
		$.ajax({
			url:"data/data.json",
			dataType:"json",
			type:"post",
			success:function(data){
				jsonData=data;//json数据
				renderListPage(data,that);
			},
			error:function(){
				alert("请求失败了！");
			}
		})
	}

	function renderListPage(data,that){
		var key=that.data("id");
		var str="";
		console.log(key);
		$.each(data[key].fenlei,function(i,e){
			str+='<a data-from="list" href="#detail" data-tit="'+e.title+'" data-source="'+key+'_'+i+'" data-from="list">'+
						'<figure>'+
							'<figcaption><img src="img/tu/'+e.img+'" alt=""></figcaption>'+
							'<p>'+e.title+'</p>'+
						'</figure>'+
					'</a> ';
		})

		$("#list>div").html(str);
	}

	function readerDetail(that){
		var source=that.data("source").split("_");
		console.log(source);
		$("#detail>div").html(jsonData[source[0]].fenlei[source[1]].content);
	}

	//搜索功能
	function seachContent(){
		var sTxt=$.trim($("#searHeader").val());
		var result=[],
			str="",
			aSource=[];
		if(sTxt=="") return false;
		//jsonData.key.fenlei[0].title
		$.each(jsonData,function(key,val){
			$.each(val.fenlei,function(i,e){
				if(e.title.indexOf(sTxt)>-1){
					result.unshift(e.title);
					aSource.unshift(key+"_"+i);
				}
			})
		})

		if(result.length==0){
			$("<li>没有查找到相关内容</li>").appendTo("#searchf>ul");
		}else{
			$.each(result,function(index,val){
				str+="<li><a href='#detail' data-tit='"+val+"' data-source='"+aSource[index]+"' data-from='searchf'>"+val+"</a></li>";
			})
			$("#searchf>ul").html(str);
		}
		
		console.log(result);
	}

	//收藏功能
	function favorite(){
		//获取要收藏的文字，标题的文字
		var favTxt=$("#title").text(),
			ls=window.localStorage,
			aFav=JSON.parse(ls.getItem("fav")),
			already=false;

		console.log(favTxt);
		//判断是否被收藏过,从本地存储中取出收藏的内容，然后在判断收藏的文字在不在本地存储中，
		if(aFav.length==0){
			aFav.unshift(favTxt);
			ls.setItem("fav",JSON.stringify(aFav));
			alert("收藏成功了！");
		}else{
			//收藏中有内容了
			//判断是否被收藏过
			$.each(aFav,function(i,v){
				if(v==favTxt){
					already=true;
				}
			})

			if(already){
				alert("已经收藏了！");
			}else{
				aFav.unshift(favTxt);
				ls.setItem("fav",JSON.stringify(aFav));
				alert("收藏成功了！");
			}
		}

		//显示到收藏页中
		showFavorite();
	}

	//显示到收藏页中
	function showFavorite(){
		var ls=window.localStorage,
			favHTML='',
			getFav=JSON.parse(ls.getItem("fav"));//从本地存储中取出数据并转换为数组
		$.each(getFav,function(index,ele){
			var source=getSource(ele);
			favHTML+="<li><a href='detail' data-from='favorite' data-tit='"+ele+"' data-source='"+source+"'>"+ele+"</a></li>";
		})

		$("#favorite ul").html(favHTML);
	}


	//获取标题所对应key及索引
	function getSource(option){
		$.each(jsonData,function(key,val){
			$.each(val.fenlei,function(i,ele){
				if(ele.title==option){
					return key+"_"+i;
				}
			})
		})
	}

	/*function history(){
		//获取要收藏的文字，标题的文字
		var favTxt=$("#title").text(),
			ls=window.localStorage,
			aFav1=JSON.parse(ls.getItem("fav")),
			already=false;

			$.each(aFav1,function(i,e){
				var source1=getSource(ele);
				favHTML1+="<li><a href='detail' data-from='favorite' data-tit='"+ele+"' data-source='"+source+"'>"+ele+"</a></li>";
			})
		$("#history ul").html(favHTML1);
	}*/

	//显示到历史记录页中
		function showHistory(){
			var ls=window.localStorage,
				 hisHTML="",
			getHis=JSON.parse(ls.getItem("fav"));//从本地存储中取出数组
			$.each(getHis,function(index,ele){
				hisHTML+="<li><a href='#detail' data-tit='"+ele+"' data-from='history'>"+ele+"</a></li>";

			})
			$("#history ul").html(hisHTML);
		};

})(Zepto)