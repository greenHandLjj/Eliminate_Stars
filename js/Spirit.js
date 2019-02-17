(function(w){
	
	//row，为第几行，col为这个元素在第几列，type为随机的0~7
	var Spirit = w.Spirit = function(row,col,imageName){
		
		//图片名
		this.imageName = imageName;
		//元素是否在移动状态
		this.isMove = false;
		//元素是否处于消除中，进行特效
		this.isBoom = false;
		//爆炸帧，爆炸特效图一共9张，从0开始
		this.boomStep = 0;
		//运动了多少帧
		this.moveN = 0;
		//元素是否是爆炸完成后，消失状态
		this.isHide = false;
		//获取x，y，以及大小
		var coordinate = getCoordinate(row,col);
		
		this.x = coordinate.x;
		this.y = coordinate.y;
		this.size = coordinate.w;
		
	}
	//渲染
	Spirit.prototype.render = function(){
		
		//爆炸完后，元素处于消失状态
		if(this.isHide) return;
		
		//如果不是处于爆炸中，就渲染精灵
		if(!this.isBoom){
			//绘制，让每个元素有空隙，所有加上2的偏移，并且让总宽度 - 4，好居中
			game.ctx.drawImage(game.R[this.imageName],this.x + 2,this.y + 2,this.size - 4,this.size - 4);
		}else{ 
			//渲染爆炸特效
			game.ctx.drawImage(game.R['bom' + this.boomStep],this.x,this.y,this.size,this.size);
		}
		
	}
	//更新
	Spirit.prototype.update = function(){
		
		//爆炸完后，元素处于消失状态，不应该继续更新
		if(this.isHide) return;
		
		//可以移动时，再进行移动
		if(this.isMove){
			this.x += this.dx;
			this.y += this.dy;
			//一旦开始运动，运动到一定时间，就要停止
			this.moveN --;
		}
		
		//到达目标点，停止移动
		if(this.moveN <= 0){
			this.isMove = false;
		}
		
		if(this.isBoom){
			//帧率过快，适当处理
			game.fno % 3 == 0 && this.boomStep ++;
			if(this.boomStep > 8){ //图片到第8张就应该取消渲染爆炸
				//元素停止爆炸
				this.isBoom = false;
				//元素爆炸后消失
				this.isHide = true; 
			}
		}
		
	}
	//移动算法
	Spirit.prototype.moveTo = function(row,col,time){
		
		this.isMove = true;
		//获取x，y，以及大小
		var coordinate = getCoordinate(row,col);
		//需要移动到的x，y位置
		var x = coordinate.x;
		var y = coordinate.y;
		
		//总路程/总时间 = 速度
		this.dx = (x - this.x)/time;
		this.dy = (y - this.y)/time;
		
		//记录时间，时间节点小于0就停止
		this.moveN = time;
		
	}
	//爆炸功能
	Spirit.prototype.boom = function(){
		this.isBoom = true;
	}
	
	//工具类函数，获取x，y轴坐标
	function getCoordinate(row,col){

		//输出自己X，Y坐标
		return {
			x : game.padding + game.size * col, //行
			y : game.startY + game.size * row,  //列
			w : game.size//大小
		}
	}
	
	
})(window)