
import { _decorator, Component, Prefab, instantiate, Node, CCInteger, Animation, Vec3, Label,ParticleSystem } from 'cc';
import { PlayerController } from "./PlayerController";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = GameManager
 * DateTime = Fri Feb 11 2022 22:27:39 GMT+0800 (香港标准时间)
 * Author = 710953586
 * FileBasename = GameManager.ts
 * FileBasenameNoExtension = GameManager
 * URL = db://assets/Scripts/GameManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

enum GameState {
    GS_PLAYING,
    GS_END,
};
@ccclass('GameManager')
export class GameManager extends Component {
    // 赛道预制
    @property({ type: Prefab })
    public cubePref: Prefab | null = null
    // 关联 Player 节点身上 PlayerController 组件
    @property({ type: PlayerController })
    public playerCtrl: PlayerController | null = null;
    @property({ type: ParticleSystem })
    public playerParticle : ParticleSystem | null = null;
    @property({ type: Animation })
    public BodyAnim: Animation | null = null;
    // 结束界面根节点
    @property({ type: Node })
    public endMenu: Node | null = null;
    // 关联分数文本组件
    @property({ type: Label })
    public scoreLabel: Label = null!;
    // 当前平台左边界
    private curCubeLeftBorder: number = 0
    // 当前平台右边界
    private curCubeRightBorder: number = 0
    // 下一平台左边界
    private nextCubeLeftBorder: number = 0
    // 下一平台右边界
    private nextCubeRightBorder: number = 0
    // 玩家得分
    private playerScore: number = 0

    start() {
        this.curState = GameState.GS_PLAYING
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this)
    }
    set curState(value: GameState) {
        switch (value) {
            case GameState.GS_PLAYING:
                this.init()
                this.playerCtrl.setInputActive(true);
                this.endMenu.active = false
                break;
            case GameState.GS_END:
                this.playerCtrl.setInputActive(false);
                this.endMenu.active = true
                break;
        }
    }
    init() {
        // 生成赛道
        if (this.endMenu) {
            this.endMenu.active = false
        }
        this.generateRoad();
        if (this.playerCtrl) {
            // 禁止接收用户操作人物移动指令
            this.playerCtrl.setInputActive(false);
            // 重置人物位置
            this.playerCtrl.node.setPosition(Vec3.ZERO);
            this.BodyAnim.node.setPosition(new Vec3(0,1,0))
            this.BodyAnim.node.setRotationFromEuler(Vec3.ZERO)
            this.playerScore = 0
            this.scoreLabel.string = '' + this.playerScore
        }
    }
    generateRoad() {
        // 防止游戏重新开始时，赛道还是旧的赛道
        // 因此，需要移除旧赛道，清除旧赛道数据
        this.node.destroyAllChildren()
        // 平台大小：2到3
        let cubeSize = Math.floor(Math.random() * 2) + 2
        // 生成第一个平台
        let cube = instantiate(this.cubePref)
        this.node.addChild(cube)
        cube.setScale(cubeSize, 1, 1)
        cube.setPosition(0, -1.5, 0)
        // 生成第二个平台
        this.generateNextCube(cubeSize / 2)
        this.curCubeLeftBorder = -cubeSize / 2
        this.curCubeRightBorder = cubeSize / 2
    }
    generateNextCube(lastCubeRightBorder: number) {
        // 平台大小：2到3
        let cubeSize = Math.floor(Math.random() * 2) + 2
        // 平台间距：2到5
        let cubeGap = Math.floor(Math.random() * 4) + 2
        this.curCubeLeftBorder = this.nextCubeLeftBorder
        this.curCubeRightBorder = this.nextCubeRightBorder
        this.nextCubeLeftBorder = lastCubeRightBorder + cubeGap
        this.nextCubeRightBorder = lastCubeRightBorder + cubeGap + cubeSize
        // 平台中心
        let cubeCenter = (this.nextCubeLeftBorder + this.nextCubeRightBorder) / 2
        let cube = instantiate(this.cubePref)
        this.node.addChild(cube)
        cube.setPosition(cubeCenter, -1.5, 0)
        cube.setScale(cubeSize, 1, 1)
        cube.getChildByName("Body").getComponent(Animation).play()
    }
    onPlayerJumpEnd(playerPos: number) {
        // 跳跃后还在当前平台上
        if (playerPos > this.curCubeLeftBorder && playerPos < this.curCubeRightBorder) {
            // do nothing
        }
        // 跳跃后在下一平台上
        else if (playerPos > this.nextCubeLeftBorder && playerPos < this.nextCubeRightBorder) {
            this.generateNextCube(this.nextCubeRightBorder)
            this.playerScore += 1
            this.scoreLabel.string = '' + this.playerScore
        }
        // 跳出平台，失败
        else {
            let isNearCurCubeRightBorder: boolean = playerPos > this.curCubeRightBorder
                && playerPos < this.curCubeRightBorder + 0.5
            let isNearNextCubeRightBorder: boolean = playerPos > this.nextCubeRightBorder
                && playerPos < this.nextCubeRightBorder + 0.5
            let isNearNextCubeLeftBorder: boolean = playerPos < this.nextCubeLeftBorder
                && playerPos > this.nextCubeLeftBorder - 0.5
            if (isNearCurCubeRightBorder || isNearNextCubeRightBorder) {
                this.BodyAnim.play("fallRight")
            }
            else if (isNearNextCubeLeftBorder) {
                this.BodyAnim.play('fallLeft')
            }
            else {
                this.BodyAnim.play('fall')
            }
            this.curState = GameState.GS_END
            setTimeout(() => { 
                this.curState = GameState.GS_PLAYING
             }, 3000)
        }
    }
    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
