// Pixi.js Canvas for Dynamic User Visualization
export class PixiCanvas {
    constructor() {
        this.app = null;
        this.userRectangles = [];
        this.container = null;
        // Track connected users
        this.users = new Map();
        this.init();
    }

    async init() {
        // Create Pixi Application
        this.app = new PIXI.Application();
        await this.app.init({
            width: 800,
            height: 400,
            backgroundColor: 0x667eea,
            resizeTo: document.getElementById('pixiCanvas')
        });

        // Add canvas to DOM
        const canvasContainer = document.getElementById('pixiCanvas');
        canvasContainer.appendChild(this.app.canvas);

        // Create container for user rectangles
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);

        // Start animation loop using Pixi.js ticker
        this.app.ticker.add(this.animate, this);

        console.log('Pixi.js canvas initialized');
    }

    // Generate random pastel color for user
    generatePastelColor() {
        const hue = Math.random() * 360;
        const saturation = 40 + Math.random() * 30;
        const lightness = 70 + Math.random() * 20;
        
        // Convert HSL to RGB
        const c = (1 - Math.abs(2 * lightness/100 - 1)) * saturation/100;
        const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = lightness/100 - c/2;
        
        let r, g, b;
        if (hue < 60) { r = c; g = x; b = 0; }
        else if (hue < 120) { r = x; g = c; b = 0; }
        else if (hue < 180) { r = 0; g = c; b = x; }
        else if (hue < 240) { r = 0; g = x; b = c; }
        else if (hue < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        return (r << 16) | (g << 8) | b;
    }

    createUserRectangle(name, color, x, y, index) {
        // Create container to hold rectangle and text
        const userContainer = new PIXI.Container();
        userContainer.x = x;
        userContainer.y = y;

        // Create rectangle
        const rect = new PIXI.Graphics();
        rect.rect(0, 0, 80, 40);
        rect.fill(color);
        rect.stroke({ width: 2, color: 0xFFFFFF });

        // Create text label
        const text = new PIXI.Text({
            text: name,
            style: {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0x000000,
                fontWeight: 'bold'
            }
        });

        // Center text on rectangle
        text.anchor.set(0.5);
        text.x = rect.width / 2;
        text.y = rect.height / 2;

        // Add rectangle and text to container
        userContainer.addChild(rect);
        userContainer.addChild(text);

        // Add animation properties to container
        userContainer.userData = {
            originalX: x,
            originalY: y,
            velocityX: (Math.random() - 0.5) * 2,
            velocityY: (Math.random() - 0.5) * 2,
            name: name,
            index: index
        };

        // Store width/height for collision detection
        userContainer.width = 80;
        userContainer.height = 40;

        // Add to container and tracking array
        this.container.addChild(userContainer);
        this.userRectangles.push(userContainer);
        
        // Store in users map
        this.users.set(name, userContainer);
    }

    animate(ticker) {
        // Animate user rectangles (now containers)
        this.userRectangles.forEach(userContainer => {
            const userData = userContainer.userData;
            
            // Update position using ticker deltaTime for frame-rate independent animation
            userContainer.x += userData.velocityX * ticker.deltaTime;
            userContainer.y += userData.velocityY * ticker.deltaTime;

            // Bounce off edges
            const bounds = this.app.screen;
            if (userContainer.x <= 0 || userContainer.x >= bounds.width - userContainer.width) {
                userData.velocityX *= -1;
                userContainer.x = Math.max(0, Math.min(bounds.width - userContainer.width, userContainer.x));
            }
            if (userContainer.y <= 0 || userContainer.y >= bounds.height - userContainer.height) {
                userData.velocityY *= -1;
                userContainer.y = Math.max(0, Math.min(bounds.height - userContainer.height, userContainer.y));
            }

            // Add subtle floating effect using ticker elapsed time
            const time = ticker.lastTime * 0.001;
            userContainer.x += Math.sin(time + userData.index) * 0.5 * ticker.deltaTime;
            userContainer.y += Math.cos(time + userData.index) * 0.3 * ticker.deltaTime;
        });
    }

    // Clean up animation loop
    destroy() {
        if (this.app && this.app.ticker) {
            this.app.ticker.remove(this.animate, this);
        }
    }

    // Add new user to canvas
    addUser(name) {
        // Don't add if user already exists
        if (this.users.has(name)) {
            return;
        }
        
        // Generate random pastel color and position
        const color = this.generatePastelColor();
        const x = Math.random() * (this.app.screen.width - 80);
        const y = Math.random() * (this.app.screen.height - 40);
        
        this.createUserRectangle(name, color, x, y, this.userRectangles.length);
    }

    // Remove user from canvas
    removeUser(name) {
        const userContainer = this.users.get(name);
        if (userContainer) {
            // Remove from container
            this.container.removeChild(userContainer);
            
            // Remove from tracking arrays
            const index = this.userRectangles.indexOf(userContainer);
            if (index !== -1) {
                this.userRectangles.splice(index, 1);
            }
            
            // Remove from users map
            this.users.delete(name);
        }
    }
    
    // Update user list from server
    updateUsers(userList) {
        // Remove users no longer in the list
        const currentUsers = new Set(this.users.keys());
        const newUsers = new Set(userList);
        
        for (const user of currentUsers) {
            if (!newUsers.has(user)) {
                this.removeUser(user);
            }
        }
        
        // Add new users
        for (const user of userList) {
            if (!this.users.has(user)) {
                this.addUser(user);
            }
        }
    }
}