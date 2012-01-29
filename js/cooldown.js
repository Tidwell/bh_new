var cooldownTimer = function(opt) {
	var self = this;
	this.canvas = document.getElementById(opt.id);
	var $c = $(this.canvas);
	this.context = this.canvas.getContext('2d');
	this.width = $c.width();
	this.height = $c.height();
	this.centerX = $c.width() / 2;
    this.centerY = $c.height() / 2;
	var d = new Date;
	this.startTime = d.getTime();
	this.cooldown = opt.cooldown*10;
	this.cooldownComplete = 0;
	this.interval = opt.interval || 30;
	setTimeout(function() {self.loop()},self.interval);
}
cooldownTimer.prototype.destroy = function() {
	$(this.canvas).remove();
}
cooldownTimer.prototype.loop = function() {
	var self = this;
	var d = new Date;
	var t =  d.getTime()-self.startTime;
	if (self.cooldownComplete >= self.cooldown) {
		self.destroy();
		return;
	}else {
		self.cooldownComplete += t;
		var pct = self.cooldownComplete/self.cooldown;
		if (pct > 1) {pct = 1;}
		self.update(-pct);
		setTimeout(function() {self.loop()},self.interval);
	}
}
cooldownTimer.prototype.update = function(progress) {
	this.context.clearRect(0, 0, this.width, this.height);
	
	// Black background
	this.context.fillStyle = ('rgba(0,0,0,0)');
	this.context.fillRect(0, 0, this.width, this.height);
	
	// White to show the progress
	this.context.fillStyle = 'rgba(0,0,0,.825)';	
	this.context.beginPath();
	this.context.moveTo(this.centerX, this.centerY);
	this.context.arc(this.centerX, this.centerY, this.width, -Math.PI / 2, 2 * Math.PI * progress - Math.PI / 2, false);
	this.context.lineTo(this.centerX, this.centerY);
	this.context.fill();
	this.context.closePath();
}	
