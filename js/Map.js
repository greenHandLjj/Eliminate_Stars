(function(w){
	
	//用来管理并创建矩阵地图
	var Map = w.Map = function(){
		
		//进行消除及选择精灵图矩阵
		this.code = [
/* 			[0,1,1,1,4,5,6],
			[1,2,1,1,5,6,6],
			[0,1,1,3,4,3,6],
			[0,0,5,3,4,5,5],
			[0,1,2,4,4,5,5],
			[1,1,2,3,6,5,6],
			[0,1,2,3,4,5,6], */
			[parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7)],
			[parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7)],
			[parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7)],
			[parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7)],
			[parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7)],
			[parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7)],
			[parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7),parseInt(Math.random() * 7)]
		];
		//通过code矩阵，生成真正的实例化精灵
		this.spiritsArr = [[],[],[],[],[],[],[]];
		//存放所有需要下落的元素，下落几格信息
		this.nendDropArr = [[],[],[],[],[],[],[]];
		//所有精灵
		this.imagesArr = ['i0','i1','i2','i3','i4','i5','i6','i7','i8','i9','i10','i11','i12','i13','i14'];
		//从14个精灵中抽选7位参与游戏，加大成功概率
		this.imageNameArr = unravel(this.imagesArr,7);
		//执行函数
		this.createSpirit();
		
	}
	//根据code创建7*7精灵数组
	Map.prototype.createSpirit = function(){
		
		for(var i = 0; i < 7; i++){
			for(var j = 0; j < 7; j++){
				this.spiritsArr[i][j] = new Spirit(i,j,this.imageNameArr[this.code[i][j]]);
			}
		}
		
	}
	//渲染
	Map.prototype.render = function(){
		for(var i = 0; i < 7; i++){
			for(var j = 0; j < 7; j++){
				//容错处理
				this.spiritsArr[i][j] && this.spiritsArr[i][j].render();
				this.spiritsArr[i][j] && this.spiritsArr[i][j].update();
			}
		}
	}
	//找出所有横竖3个连着的元素，返回数组 -- [{'row':n,'col':n}...]
	Map.prototype.findConnectArr = function(){
		/* 
			实现思路：
			i j
			i = 0;
			j = 1;
			往下遍历，如果 arr[i] === arr[j],i 不变，j ++;
					，如果 arr[i] !== arr[j],i = j，j ++, ;
		 */
		
		//i = 0 , j = 1
		/* 
			arr[0] != arr[1];
				i = 1;j = 2;
			arr[1] == arr[2];
				i = 1; j ++; j = 3
			arr[1] == arr[3]
				i = 1, j ++; j = 4；
			arr[i] == arr[4]
				i = 1, j ++; j = 5;
			arr[1] != arr[5]
				i = 5, j ++; j = 6;
			arr[5] == arr[6]
				i = 5, j ++; j = 7;
			arr[5] == arr[7]
				i = 5, j ++; j = 8;
		 */
		
		//补全原数组，以防报错
		var arr = this.code.concat([[]]);
		var result1 = [];
		
		for(var a = 0; a < 7; a++){
			
			var i1 = 0;
			var j1 = 1;
			
			while(i1 < 7){
				if(arr[a][i1] != arr[a][j1]){
					i1 = j1;
				}else{
					if(j1 - i1 >= 2){
						for(var k = i1; k <= j1; k ++){
							result1.push({'row':a,'col':k})
						}
					}
				}
				j1 ++;
			}
			
		}
		
		var result2 = [];
		
		for(var b = 0; b < 7; b++){
			
			var i2 = 0;
			var j2 = 1;
			
			while(i2 < 7){
				if(arr[i2][b] != arr[j2][b]){
					i2 = j2;
				}else{
					if(j2 - i2 >= 2){
						for(var k = i2; k <= j2; k++){
							var isRepeat = false;
							result1.forEach(function(item){
								if(item.row == k && item.col == b){
									isRepeat = true;
								}
							})
							if(!isRepeat){
								result2.push({'row':k,'col':b})
							}
						}
					}
				}
				j2 ++;
			}
			
		}
		
		return result1.concat(result2);
	}
	//消除精灵类，并且改变this.code数组，且移动
	Map.prototype.removeSpirits = function(callback){
		//播放消除音效
		game.Music['bom1'].load();
		game.Music['bom1'].play();
		//判定如果两次连续消除的时间小于5秒（50帧一秒 50 * 5），就判定连续消除
		if(game.fno - game.lastFno < 250){
			game.doubleHit ++;
			//跟进帧编号
			game.lastFno = game.fno;
		}else{
			game.doubleHit = 1;
		}
		//连续消除加分翻倍
		game.scroe += game.doubleHit;
		
		var arr = this.findConnectArr();
		for(var i = 0; i < arr.length; i++){
			this.spiritsArr[arr[i].row][arr[i].col].boom();
			this.code[arr[i].row][arr[i].col] = '';
		}
		
		//这里执行传入的回调函数，负责移动，爆炸时间为27毫秒后 game.fno % 3 == 0 && this.boomStep ++;
		//每隔3帧动画一次，特效图片为9张
		game.callback(27,callback)
	}
	//计算出每一个缺失元素的下方坍塌几位，并且进行moveTo操作
	Map.prototype.getNendDropArr = function(callback){
		//最底下一层无需遍历，也就是[0][n]
		for(var i = 0; i < 6; i ++){
			for(var j = 0; j < 7; j++){
				if(this.code[i][j] === ''){ //已经被消除，无需移动
					this.nendDropArr[i][j] = '';
				}else{
					//开始计数，不能计算头顶的空白，
					var count = 0;
					for(var k = i; k < 7; k ++){ //i 代表行，j 代表列
						if(this.code[k][j] === ''){
							count ++;
						}
					}
					this.nendDropArr[i][j] = count;
					//进行移动，移动距离为 原本自己的行数 + count = 要运行的行数
					this.spiritsArr[i][j].moveTo(count + i,j,20);
				}
			}
		}
		/* 循环内容：
			查询每一行中有无被消除的方块，有的话就置为空，没有的话开始声明count
			初始值为0，用来记录自己下方有多少个被消除的方块
			开始循环，以i为循环的行，在for中，j为固定不变的列，找到[i][j] 下方消除的方块，如果有
			count++；
			返回count，并且填写进新的数组当中，以便使用；
		 */
		//下落完成后，对坐标进行重新排列
		this.correct()
		
		//执行回调函数20毫秒后，补齐动画
		game.callback(20,callback)
	}
	//坍塌完后的数组，元素只是位置发生了改变，但是实际坐标没有变化，也就是说，原本[0][0]的元素向下移动到[3][0]的位置，这只是视觉看上去到了
	//实际坐标还是[0][0],下面这个函数用来矫正坐标及元素坐标
	Map.prototype.correct = function(){
		//为了不影响上面元素变化，所以从下往上循环，一样，最下层无需判断
		for(var i = 5; i >= 0; i --){
			for(var j = 0; j < 7; j++){
				if(this.code[i][j] !== ''){
					//上一个code值
					var lastNum = this.code[i][j];
					//上一个元素，找到精灵矩阵，保存
					var lastSpirit = this.spiritsArr[i][j];
					//下移多少
					var count = this.nendDropArr[i][j];
					//将原来的位置变为空
					this.code[i][j] = '';
					this.spiritsArr[i][j] = '';
					//附上全新的坐标
					this.code[i + count][j] = lastNum;
					this.spiritsArr[i + count][j] = lastSpirit;
				}
			}
		}
	}
	//补齐元素及坐标
	Map.prototype.makeUp = function(){
		//记录每行缺失多少个元素
		var lack = [0,0,0,0,0,0,0];
		//循环找出每一列缺失多少个元素
		for(var i = 0; i < 7; i++){
			for(var j = 0; j < 7; j++){
				if(this.code[j][i] === ''){
					//记录缺失数
					lack[i] ++;
					//补足缺失code位，
					this.code[j][i] = parseInt(Math.random() * 7);
				}
			}
		}
		
		//根据第一个createSpirit函数，补足精灵数组,必须先new出来，在进行操作
		this.createSpirit()
		
		//根据lack数组，来找出那几个元素是新元素，i指代列，j指代行
		for(var i = 0; i < 7; i++){
			for(var j = 0; j < lack[i]; j ++){
				this.spiritsArr[j][i].y = 20;
				//下落动画
				this.spiritsArr[j][i].moveTo(j,i,20);
			}
		}

	}
	//拖拽交换
	Map.prototype.exchange = function(targetRow,targetCol,originRow,originCol){
		
		//改变状态机，防止用户快速点击
		game.fms = '动画中';
		//物理形式交换位置
		this.spiritsArr[originRow][originCol].moveTo(targetRow,targetCol,20);
		this.spiritsArr[targetRow][targetCol].moveTo(originRow,originCol,20);
		
		//矩阵位置交换,先保存中间变量，以供周转
		var matrix = this.code[originRow][originCol];
		this.code[originRow][originCol] = this.code[targetRow][targetCol];
		this.code[targetRow][targetCol] = matrix;
		
		var self = this;
		//如果不延迟20帧，动画效果将消失，因为，如果转换位置后，无法消除，走进判断，立马交换回来位置，两次动画相抵消失
		game.callback(20,function(){
			//检查能否消除
			if(self.findConnectArr().length == 0){
				//不能消除，把位置重新交换
				self.spiritsArr[originRow][originCol].moveTo(originRow,originCol,20);
				self.spiritsArr[targetRow][targetCol].moveTo(targetRow,targetCol,20);
				
				//矩阵位置再次交换
				var matrix = self.code[originRow][originCol];
				self.code[originRow][originCol] = self.code[targetRow][targetCol];
				self.code[targetRow][targetCol] = matrix;
				
				//20毫秒后回归为静稳状态,防止用户快速点击
				game.callback(20,function(){
					game.fms = 'A'
				})
								
			}else{
			
				//能进行消除，改变真正的精灵矩阵
				var nowSpirit = self.spiritsArr[originRow][originCol];
				self.spiritsArr[originRow][originCol] = self.spiritsArr[targetRow][targetCol];
				self.spiritsArr[targetRow][targetCol] = nowSpirit;
				
				//改变状态机
				game.fms = 'C';
			}
		})
		
	}
	
	//工具类函数，传入原数组，需要随机在原数组中随机挑选n位且不重复的值
	function unravel(arr,n){
		var newArr = [];
		var len = arr.length;
		for(var i = 0; i < n; i++){
			newArr[i] = arr[parseInt(Math.random() * len)];
			for(var j = 0; j < newArr.length; j ++){
				if(i !== j && newArr[i] === newArr[j]){ //重复了
					var bool = true;
					while(bool){
						var can = arr[parseInt(Math.random() * len)]
						var str = newArr.find((item) => {
							return item == can
						})
						if(str == undefined){
							newArr[j] = can;
							bool = false;
						}
					}
					
				}
			}
		}
		return newArr;
	}
	
	
})(window)