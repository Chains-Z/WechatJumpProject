
import { _decorator, Component, Vec3, input, Input, EventKeyboard, Animation, Node,ParticleSystem, KeyCode } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = PlayerController
 * DateTime = Thu Feb 10 2022 20:29:41 GMT+0800 (香港标准时间)
 * Author = 710953586
 * FileBasename = PlayerController.ts
 * FileBasenameNoExtension = PlayerController
 * URL = db://assets/Scripts/PlayerController.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('PlayerController')
export class PlayerController extends Component {
    private _startJump: boolean = false;
    private _startCharge : Boolean = false;
    private _IsCompressed : boolean = false;
    // 当前跳跃速度
    private _curJumpSpeed: number = 0;
    // 当前角色位置
    private _curPos: Vec3 = new Vec3();
    // 每次跳跃过程中，当前帧移动位置差
    private _deltaPos: Vec3 = new Vec3(0, 0, 0);
    // 角色目标位置
    private _targetPos: Vec3 = new Vec3();
    //蓄力的加速度
    private _acceleratedSpeed : number = 25;
    // 当前跳跃时间
    private _curJumpTime: number = 0;
    // 每次跳跃时常
    private _jumpTime: number = 0.5;
    // 主角压缩的程度
    private _curCompressLevel : number = 1;
    // 主角压缩的速度
    private _compressSpeed : number = 1;
    // 主角压缩的极限
    private _compressLimit : number = 0.4;
    // 主角释放的速度
    private _releaseSpeed : number = 4;
    // 动画组件
    @property({type: Animation})
    public BodyAnim: Animation | null = null;
    // 坐标系在脚底的主角节点,用于压缩主角
    @property({type: Node})
    public LocalBody: Node | null = null;
    // 粒子系统
    @property({type : ParticleSystem})
    public particleSys : ParticleSystem | null = null

    start () {
        this.particleSys.enabled = false
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }
    setInputActive(active : boolean){
        if(active){
            input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
            input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        }
        else{
            input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
            input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this)
        }
    }
    onKeyUp(event : EventKeyboard){
        if(event.keyCode === KeyCode.SPACE){
            this.jump()
        }


    }
    onKeyDown(event : EventKeyboard){
        if(event.keyCode === KeyCode.SPACE){
            this.charge()
        }

    }
    jump(){
        this.particleSys.enabled = false
        this._startJump = true
        this._startCharge = false
        this._curJumpTime = 0
        this.node.getPosition(this._curPos)
        let jumpDistance = this._curJumpSpeed * this._jumpTime
        Vec3.add(this._targetPos,this._curPos,new Vec3(jumpDistance,0,0))
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this)
    }
    charge(){
        this.particleSys.enabled = true
        this.particleSys.clear()
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        this._startCharge = true
        this._IsCompressed = true
    }
    onOnceJumpEnd() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        this._curJumpSpeed = 0
        this.node.emit('JumpEnd', this._targetPos.x);
    }
    update (deltaTime: number) {
        if(this._startCharge){
            this._curJumpSpeed += this._acceleratedSpeed * deltaTime;
            if(this._curCompressLevel > this._compressLimit)
                this._curCompressLevel -= this._compressSpeed * deltaTime;
            this.LocalBody.setScale(new Vec3(1,this._curCompressLevel,1))
        }
        else if(this._IsCompressed){
            this._curCompressLevel += this._releaseSpeed * deltaTime;
            if(this._curCompressLevel >= 1){
                this.LocalBody.setScale(new Vec3(1,1,1))
                this._IsCompressed = false
                this.BodyAnim?.play("jump")
            }
            else{
                this.LocalBody.setScale(new Vec3(1,this._curCompressLevel,1))
            }
        }
        else if(this._startJump){
            this._curJumpTime += deltaTime;
            if(this._curJumpTime > this._jumpTime){
                this.node.setPosition(this._targetPos)
                this._startJump = false
                this.onOnceJumpEnd()
            }
            else{
                this.node.getPosition(this._curPos);
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                this.node.setPosition(this._curPos);
            }
        }
    }
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
