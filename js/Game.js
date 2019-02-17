(function(w){
	//项目以iPhone6为模板适配
	var Game = w.Game = function(obj){
		//获取canvas
		this.can = document.getElementById(obj.id);
		//获取上下文
		this.ctx = this.can.getContext('2d');
		//资源地址
		this.url = obj.url;
		//帧编号
		this.fno = 0;
		//图片资源引用存放地址
		this.R = {};
		//音乐资源引用存放地址
		this.Music = {};
		//定义游戏时间，单位秒
		this.time = 40;
		//分数
		this.scroe = 0;
		//连续击打次数
		this.doubleHit = 1;
		//定义上一次消除时间
		this.lastFno = this.fno;
		//游戏是否结束
		this.isGameOver = false;
		//记录所有回调队列中，需要到达一定帧数执行的函数，key为帧，value为fn
		this.callbacks = {};
		//记载canvas宽高,以便后续使用
		this.width = 0;
		this.height = 0;
		//初始化canvas宽高
		this.init();
		
		//存放元素信息
		this.padding = 6; //距离左边的padding
		this.size = (this.can.width - this.padding * 2) / 7; //每个方格大小
		this.paddingB = 100; //距离底部的高度
		this.startY = this.can.height - this.paddingB - this.size * 7;
		
		//初始化资源,资源获取完毕触发回调
		this.getSource(function(){
			this.start();
			//绑定监听
			this.bindEvent();
		});
	}
	//初始化canvas宽高
	Game.prototype.init = function(){
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		if(this.width > 375){
			this.width = 357;
		}
		if(this.height > 667){
			this.height = 667;
		}
		this.can.width = this.width;
		this.can.height = this.height;
	}
	//获取资源
	Game.prototype.getSource = function(fn){
		//备份this
		var self = this;
		var xhr = new XMLHttpRequest();
		//记录图片加载情况
		var num = 0;
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4 && xhr.status === 200){
				var souresImage = JSON.parse(xhr.responseText)['images'];
				var souresImageLen = souresImage.length;
				for(var i = 0; i < souresImageLen; i++){
					self.R[souresImage[i].name] = new Image();
					self.R[souresImage[i].name].src = souresImage[i].url;
					self.R[souresImage[i].name].onload = function(){
						num ++;
						self.ctx.clearRect(0,0,self.width,self.height);
						self.ctx.font = '24px 微软雅黑';
						self.ctx.textAlign = 'center';
						self.ctx.fillText('资源加载中 ' + num + '/' + souresImageLen,self.can.width/2,200);
						//所有资源加载完毕
						if(num == souresImageLen){
							fn.call(self)
						}
					}
				}
				
				var souresMusic = JSON.parse(xhr.responseText)['music'];
				var souresMusicLen = souresMusic.length;
				for(var j = 0; j < souresMusicLen; j++){
					self.Music[souresMusic[j].name] = new Audio();
					self.Music[souresMusic[j].name].src = souresMusic[j].url;
				}
				
			}
		}
		xhr.open('GET',this.url,true);
		xhr.send(null);
	}
	//添加回调机制
	Game.prototype.callback = function(timer,fn){
		this.callbacks[this.fno + timer] = fn;
	}
	//绑定监听
	Game.prototype.bindEvent = function(){
		var self = this;
		//点击事件
		this.can.onmousedown = function(event){
			//如果是处于结束状态中，点击就开始游戏
			if(self.isGameOver){
				self.startAgain()
				return;
			}
			
			//只有当前状态机为A，静稳状态时才能开始进行游戏
			if(self.fms === 'A'){

				//this.startY this.size
				var x = event.x;
				var y = event.y - self.startY;
				
				//行和列,计算方式： 求一个区间，这个区间内包含几个元素，0为下标
				var originCol = parseInt(x / self.size);
				var originRow = parseInt(y / self.size);
				
				//校验有效性
				if(originCol < 0 || originCol > 6 || originRow < 0 || originRow > 6){
					return;
				}
				
				self.can.onmousemove = function(event){
					var x1 = event.x;
					var y1 = event.y - self.startY;
					
					var targetCol = parseInt(x1 / self.size);
					var targetRow = parseInt(y1 / self.size);
					
					//校验有效性
					if(targetCol < 0 || targetCol > 6 || targetRow < 0 || targetRow > 6){
						return;
					}
					
					//不能出现跨2行，跨2列，以及斜角等超出规则的值出现
					//行相等，列相差1，或者列相等，行相差1
					if(targetRow == originRow && Math.abs(targetCol - originCol) == 1 || targetCol == originCol && Math.abs(targetRow - originRow) == 1){
						// console.log('我从',originRow,'行',originCol,'列 ，到',targetRow,'行 ，',targetCol,'列')
						//防止连续触发，注销事件
						self.can.onmousemove = null;
						//触发map交换函数
						self.map.exchange(targetRow,targetCol,originRow,originCol);
					}
					
				}
				
				self.can.onmouseup = function(){
					self.can.onmousemove = null;
					self.can.onmouseup = null;
				}
				
			}
		}
		
	}
	//GameOver
	Game.prototype.gameOver = function(){
		this.isGameOver = true;
	}
	//重新开始
	Game.prototype.startAgain = function(){
		//恢复状态位
		this.isGameOver = false;
		//分数归0
		this.scroe = 0;
		//新的矩阵
		this.map = new Map();
		//帧编号归0
		this.fno = 0;
		this.lastFno = this.fno;
		//改变状态机，进行判定，能否消除
		this.fms = 'B';
	}
	//开始游戏
	Game.prototype.start = function(){
		
		var self = this;
		//实例化地图
		this.map = new Map();
		//循环播放背景音乐
		this.Music['bgm'].loop = true;
		this.Music['bgm'].play();
		//添加有限状态机，管理状态 
		// A -- 静稳 B -- 检查能否下落 C -- 爆炸消失 - 下落 - 补充新元素
		this.fms = 'B';
		
		this.timer = setInterval(function(){
			
			self.fno ++ ;
			
			self.ctx.clearRect(0,0,self.width,self.height);
			
			//绘制背景
			self.ctx.drawImage(self.R['bg1'],0,0,self.width,self.height);
			//绘制半透明背景
			self.ctx.fillStyle = 'rgba(0,0,0,.8)';
			self.ctx.fillRect(6,self.startY,self.size*7,self.size*7);
			
			//绘制进度条，2000
			var width = (self.size * 7) - ((self.size * 7) * (self.fno / (self.time * 50)));
			if(width < 0){
				//游戏结束
				self.gameOver();
				//绘制分数
				self.ctx.font = '40px 微软雅黑';
				self.ctx.textAlign = 'center';
				self.ctx.fillStyle = '#000';
				self.ctx.fillText('您的得分为：' + self.scroe,self.can.width/2+2,self.can.height/2+2);
				self.ctx.fillStyle = '#ffc107';
				self.ctx.fillText('您的得分为：' + self.scroe,self.can.width/2,self.can.height/2);
				return ;
			}
			
			self.ctx.fillRect(6,self.can.height - 50,self.size*7,30);
			self.ctx.fillStyle = '#444';
			self.ctx.fillRect(6,self.can.height - 50,width,30)
			// console.log(width)
			//实例化矩阵
			self.map.render()
			
			//找到与当前帧匹配的回调函数，
			if(self.callbacks.hasOwnProperty(self.fno)){
				self.callbacks[self.fno]();
				//执行完后删除
				delete self.callbacks[self.fno]
			}
			
			switch(self.fms){
				case 'A':
				
					break;
				case 'B':
					//找出所有横竖3个连着的元素，返回数组 -- [{'row':n,'col':n}...]
					if(self.map.findConnectArr().length > 0){
						self.fms = 'C'
					}else{
						self.fms = 'A'
					}
					break;
				case 'C':
					//瞬间切换无法选中状态，防止函数重复多次执行
					self.fms = '动画中';
					//这个函数负责元素的消失动画等
					self.map.removeSpirits(function(){
						//这个函数的回调函数中负责下落动画
						self.map.getNendDropArr(function(){
							//这个回调函数的回调函数中负责补齐动画
							self.map.makeUp();
							//将状态控制权移交
							self.fms = 'B';
						});
					});					
					break;
			}
			
			self.ctx.font = '12px 微软雅黑';
			self.ctx.fillStyle = '#000';
			self.ctx.textAlign = 'left';
			self.ctx.fillText('FNO：' + self.fno,10,20);
			self.ctx.fillText('FMS：' + self.fms,10,40);
			self.ctx.fillText('DoubleHit：' + self.doubleHit,10,60);
			self.ctx.fillText('SCROE：' + self.scroe,10,80);
			
			//测试用table
			/* for(var i = 0; i < 7; i ++){
				for(var j = 0; j < 7; j ++){
					document.getElementById('code').getElementsByTagName('tr')[i].getElementsByTagName('td')[j].innerHTML = game.map.code[i][j]
					document.getElementById('nendDrop').getElementsByTagName('tr')[i].getElementsByTagName('td')[j].innerHTML = game.map.nendDropArr[i][j] === undefined ? '' : game.map.nendDropArr[i][j]; 
				}
			} */
			
		},20)
		
	}
	
})(window)