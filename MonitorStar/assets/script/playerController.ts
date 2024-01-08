import { _decorator, CCFloat, CCInteger, Component, input, Node, tween, Vec3, Input, EventKeyboard, KeyCode, UITransform, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('player')
export class PlayerController extends Component {
    
    @property({type: CCInteger})
    public jumpHeight: number = 0;

    @property({type: CCFloat})
    public jumpDuration: number = 0;

    @property({type: CCInteger})
    public maxMoveSpeed: number = 0;

    @property({type: CCInteger})
    public accelate: number = 0;

    private _accLeft : boolean = false;
    private _accRight: boolean = false;
    private _xSpeed: number = 0;
    private _curPos: Vec3 = new Vec3(0, 0, 0);
    private _canvasEdge : number = 0;

    private _jumpAudioSource: AudioSource = null;

    protected start() {
     
    }

    protected onLoad(): void {
        this._jumpAudioSource = this.node.getComponent(AudioSource);
        const jumpAction = this.runJumpAction();
        tween(this.node.position).then(jumpAction).start();

        this._canvasEdge = this.node.parent.getComponent(UITransform).width / 2;

       
    }

    protected update(deltaTime: number) {
        if (this._accLeft) {
            this._xSpeed -= this.accelate * deltaTime;
        } else if (this._accRight) {
            this._xSpeed += this.accelate * deltaTime;
        }

        if (Math.abs(this._xSpeed) > this.maxMoveSpeed) {
            this._xSpeed = this.maxMoveSpeed * this._xSpeed / Math.abs(this._xSpeed);
        }

        this.node.getPosition(this._curPos);
        this._curPos.x += this._xSpeed * deltaTime;
        if (this._curPos.x < -this._canvasEdge) {
            this._curPos.x = this._canvasEdge;
        } else if (this._curPos.x > this._canvasEdge) {
            this._curPos.x = -this._canvasEdge;
        }
        this.node.setPosition(this._curPos);
    }

    protected onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    public player_init() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    public player_end() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        this._accLeft = this._accRight = false;
        this._xSpeed = 0;
        this._curPos.x = 0;
        this.node.setPosition(this._curPos);
    }

    runJumpAction() {
        const jumpUp = tween().by(this.jumpDuration, {y: this.jumpHeight}, {easing: 'sineOut'});
        const jumpDown = tween().by(this.jumpDuration, {y: -this.jumpHeight}, {easing: 'sineIn'});

        const tweenSeq = tween()
                            .sequence(jumpUp, jumpDown)
                            .call(this.playJumpSound.bind(this));

        return tween().repeatForever(tweenSeq);
    }

    playJumpSound() {
        this._jumpAudioSource.play();
    }

    onKeyDown(event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.ARROW_LEFT:
                this._accLeft = true;
                break;
            case KeyCode.ARROW_RIGHT:
                this._accRight = true;
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.ARROW_LEFT:
                this._accLeft = false;
                break;
            case KeyCode.ARROW_RIGHT:
                this._accRight = false;
                break;
        }
    }
}


