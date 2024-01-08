import { _decorator, CCInteger, Component, instantiate, Label, Node, Prefab, Vec3 } from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

const BLOCK_SIZE = 40;

enum BlockType {
    BT_NONE,
    BT_STONE
}

enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END
}

@ccclass('GameManager')
export class GameManager extends Component {

    @property({type: Prefab})
    public boxPrefab: Prefab | undefined;

    @property({type: CCInteger})
    public roadLength: number = 50;

    @property({type: Node})
    public startMenu: Node | undefined;

    @property({type: PlayerController})
    public playerCtrl: PlayerController | undefined;

    @property({type: Label})
    public stepLabel: Label | undefined;

    private _road: BlockType[] = [];


    start() {
        this.setCurState(GameState.GS_INIT);
        this.playerCtrl!.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    update(deltaTime: number) {
        
    }

    generateRoad() {
        this.node.removeAllChildren();

        this._road = [];

        this._road.push(BlockType.BT_STONE);

        for (let i = 1; i < this.roadLength; i++) {
            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }

        for (let j = 0; j < this._road.length; j++) {
            let block: Node | undefined = this.spawnBlockByType(this._road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j * BLOCK_SIZE, 0, 0);
            }
        }
    }

    spawnBlockByType(type: BlockType) {
        if (!this.boxPrefab) {
            return undefined;
        }

        let block: Node | undefined;
        if (type === BlockType.BT_STONE) {
            block = instantiate(this.boxPrefab);
        }
        return block;
    }

    setCurState(value: GameState) {
        switch(value) {
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                this.play();
                break;
            case GameState.GS_END:
                break;
        }
    }

    init() {
        if( this.startMenu) {
            this.startMenu.active = true;
        }

        this.generateRoad();

        if (this.playerCtrl) {
            this.playerCtrl.setInputActive(false);
            this.playerCtrl.node.setPosition(Vec3.ZERO);
            this.playerCtrl.reset();
        }
    }

    play() {
        if( this.startMenu) {
            this.startMenu.active = false;
        }
        if (this.stepLabel) {
            this.stepLabel.string = "0";
        }

        setTimeout(() => {
            if (this.playerCtrl) {
                this.playerCtrl.setInputActive(true);
            }
        }, 1);
       
    }

    onStartButtonClicked() {
        this.setCurState(GameState.GS_PLAYING);
    }

    onPlayerJumpEnd(moveIndex: number) {
        if (this.stepLabel) {
            this.stepLabel.string = `${moveIndex >= this.roadLength ? this.roadLength : moveIndex}`;
        }
        this.checkResult(moveIndex);
    }

    checkResult(moveIndex: number) {
        if (moveIndex < this.roadLength) {
            if (this._road[moveIndex] === BlockType.BT_NONE) {
                this.setCurState(GameState.GS_INIT);
            }
        } else {
            this.setCurState(GameState.GS_INIT);
        }
    }
}


