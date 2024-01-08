import { _decorator, AudioSource, Button, Component, instantiate, Label, Node, Prefab, UIOpacity, UITransform, Vec3 } from 'cc';
import { PlayerController } from './playerController';
const { ccclass, property } = _decorator;

enum GAME_STATUS {
    GS_INIT,
    GS_PLAY,
    GS_END
}

@ccclass('game')
export class GameController extends Component {

    @property({type: Prefab})
    public starPrefab: Prefab | undefined;

    @property({type: Node})
    public groundNode: Node | undefined;

    @property({type: Node})
    public playerNode: Node | undefined;

    @property({type: Label})
    public gameOverLabel: Label = null;

    @property({type: Label})
    public scoreLabel: Label = null;

    @property({type: Button})
    public startButton: Button = null;

    private _starDuration: number = 8;
    private _timer: number = 0;

    private _groundPos: Vec3 = new Vec3();
    private _groundYPos: number = 0;

    private _playerPos: Vec3 = new Vec3();
    private _starPos: Vec3 = new Vec3();

    private _jumpHeight: number = 0;

    private _curStar: Node | undefined;

    private _curState : GAME_STATUS;

    private _score: number = 0;

    private _gainScoreAudioSource: AudioSource = null;


    protected onLoad(): void {
        this._gainScoreAudioSource = this.node.getComponent(AudioSource);
        this.groundNode.getPosition(this._groundPos);
        this._groundYPos = this._groundPos.y;
        this._jumpHeight = this.playerNode.getComponent(PlayerController).jumpHeight;
    }

    start() {
        this.updateMenuPanelStatus(GAME_STATUS.GS_INIT);
    }

    update(deltaTime: number) {
        if (this._curState !== GAME_STATUS.GS_PLAY) {
            return;
        }
        const dis = this.getPlayerDistance();
        if (dis > 0 && dis < 60) {
            this._curStar.destroy();
            this.spawnNewStar();
            this.gainScore();
        }

        if (this._timer > this._starDuration) {
            this.gameOver();
        }
        this._timer += deltaTime;
        this.updateStarStatus(this._timer / this._starDuration);

    }

    spawnNewStar() {
        if (!this.starPrefab) {
            return;
        }

        this._curStar = instantiate(this.starPrefab);
        this.node.addChild(this._curStar);
        this._curStar.setPosition(this.getNewStarPosition());
        this._timer = 0;
    }

    getNewStarPosition() {
        let randX = 0;
        const randY = this._groundYPos + Math.random() * this._jumpHeight + 33;
        const maxX = this.node.getComponent(UITransform).width / 2;
        randX = (Math.random() - 0.5) * 2 * maxX;
        return new Vec3(randX, randY);
    }

    getPlayerDistance() {
        if (!this.playerNode || !this._curStar) {
            return -1;
        }
        this.playerNode.getPosition(this._playerPos);
        this._curStar.getPosition(this._starPos);
        const len = this._playerPos.subtract(this._starPos).length();
        return len;
    }

    gainScore() {
        this._score += 1;
        this.scoreLabel.string = `Score: ${this._score}`;
        this._gainScoreAudioSource.play();
    }

    gameOver() {
        this.updateMenuPanelStatus(GAME_STATUS.GS_END);
        this.playerNode.getComponent(PlayerController).player_end();
    }

    startButtonClicked() {
        this._score = 0;
        this.scoreLabel.string = `Score: ${this._score}`;
        this.updateMenuPanelStatus(GAME_STATUS.GS_PLAY);
        this.playerNode.getComponent(PlayerController).player_init();
        this.spawnNewStar();
    }

    updateStarStatus(radio: number) {
        if (radio > 1) {
            radio = 1;
        }
        const opacity = 255 -  radio * 255
        this._curStar.getComponent(UIOpacity).opacity = opacity;
    }

    updateMenuPanelStatus(state: GAME_STATUS) {
        this._curState = state;
        switch(state) {
            case GAME_STATUS.GS_INIT:
                {
                    this.gameOverLabel.node.active = false;
                    this.scoreLabel.node.active = false;
                    this.startButton.node.active = true;
                }
                break;
            case GAME_STATUS.GS_PLAY:
                {
                    this.gameOverLabel.node.active = false;
                    const pos = this.scoreLabel.node.getPosition();
                    this.scoreLabel.node.setPosition(pos.x, pos.y + 100, pos.z);
                    this.scoreLabel.node.active = true;
                    this.startButton.node.active = false;
                }
                break;
            case GAME_STATUS.GS_END:
                {
                    this.gameOverLabel.node.active = true;
                    const pos = this.scoreLabel.node.getPosition();
                    this.scoreLabel.node.setPosition(pos.x, pos.y - 100, pos.z);
                    this.scoreLabel.node.active = true;
                    this.startButton.node.active = true;
                }
                break;
        }
    }
}


