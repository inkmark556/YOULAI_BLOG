# Unity 自由相机
### 操作方式
- WASD水平移动 (按住左SHIFT加速移动) 
- QE垂直移动   
- 鼠标右键按下旋转视角

### 代码内容
```csharp
using UnityEngine;

/// <summary>
/// 自由相机
/// </summary>
public class FreeCamera : MonoBehaviour
{
    [Tooltip("水平移动速度")] public float horizontalSpeed = 50f; //水平移动速度
    [Tooltip("垂直移动速度")] public float verticalSpeed = 10f; //垂直移动速度
    [Tooltip("鼠标旋转速度")] public float rotationSpeed = 2f; //旋转速度

    private float _rotationX; //上下旋转角度

    public void Update()
    {
        HandleMove();
        HandleRotate();
    }

    /// <summary>
    /// 相机移动
    /// </summary>
    private void HandleMove()
    {
        //视角平行移动
        var horizontal = Input.GetAxis("Horizontal");
        var vertical = Input.GetAxis("Vertical");
        var direction = horizontalSpeed * Time.deltaTime * new Vector3(horizontal, 0f, vertical);

        if (Input.GetKey(KeyCode.LeftShift))  //按Shift移动加速
            direction *= 3;

        transform.Translate(direction);

        //  控制摄像机垂直移动
        if (Input.GetKey(KeyCode.Q))
            transform.position += transform.up * (verticalSpeed * Time.deltaTime);
        else if (Input.GetKey(KeyCode.E))
            transform.position -= transform.up * (verticalSpeed * Time.deltaTime);
    }


    /// <summary>
    /// 视角旋转
    /// </summary>
    private void HandleRotate()
    {
        if (Input.GetMouseButton(1))
        {
            var mouseX = Input.GetAxis("Mouse X") * rotationSpeed;
            var mouseY = Input.GetAxis("Mouse Y") * rotationSpeed;

            _rotationX -= mouseY;
            _rotationX = Mathf.Clamp(_rotationX, -90， 90);
            transform.localRotation = Quaternion.Euler(_rotationX, transform.localEulerAngles.y, 0f);
            transform.Rotate(Vector3.up * mouseX, Space.World);
        }
    }
}
```

# Unity RTS相机1
```csharp
using UnityEngine;

public class CameraController01 : MonoBehaviour
{
    private Vector3 moveInput;//接收键盘的输入量
    [SerializeField] private float panSpeed;//相机平移的速度

    [SerializeField] private float scrollSpeed;//鼠标滚动的速度

    private void Update()
    {
        HandleMovementInput();
    }

    private void HandleMovementInput()
    {
        //我们其实动态改变的是Main Camera的Trans组件的Pos
        Vector3 pos = transform.position;

        //moveInput = new Vector3(Input.GetAxisRaw("Horizontal"), 0, Input.GetAxisRaw("Vertical"));//性能？
        moveInput.Set(Input.GetAxisRaw("Horizontal"), 0, Input.GetAxisRaw("Vertical"));

        Vector2 mousePos = Input.mousePosition;
        if (mousePos.x > Screen.width * 0.9f && mousePos.x < Screen.width)
            moveInput.x = 1;
        if (mousePos.x < Screen.width * 0.1f && mousePos.x > 0)
            moveInput.x = -1;
        if (mousePos.y > Screen.height * 0.9 && mousePos.y < Screen.height)
            moveInput.z = 1;
        if (mousePos.y < Screen.height * 0.1 && mousePos.y > 0)
            moveInput.z = -1;

        //pos += moveInput * panSpeed * Time.deltaTime;//ERROR
        //pos += moveInput.normalized * panSpeed * Time.deltaTime;//匀速运动，归一化/向量化

        pos.x += moveInput.normalized.x * panSpeed * Time.deltaTime;
        pos.y += Input.GetAxis("Mouse ScrollWheel") * scrollSpeed * Time.deltaTime;//Y轴滚轮输入量
        pos.z += moveInput.normalized.z * panSpeed * Time.deltaTime;

        pos.x = Mathf.Clamp(pos.x, -10, 10);
        pos.y = Mathf.Clamp(pos.y, 5, 30);
        pos.z = Mathf.Clamp(pos.z, -25, 5);//根据自己的地图范围进行调整，可以设置为变量，方便嘛！

        transform.position = pos;
    }
}
```

# Unity RTS相机2
```csharp
using System;
using UnityEngine;

public class CameraController02 : MonoBehaviour
{
    private float panSpeed;
    [SerializeField] private float moveTime;//缓冲时间，用于之后的Vector3.Lerp和Quaternion.Lerp方法/函数
    [SerializeField] private float normalSpeed, fastSpeed;

    private Vector3 newPos;
    private Quaternion newRotation;
    [SerializeField] private float rotationAmount;//旋转的程度

    private Transform cameraTrans;//子物体嘛～主相机Trans，要改YZ数值
    [SerializeField] private Vector3 zoomAmount;//要改YZ数值，设置zoomAmount结构体中YZ的数值
    private Vector3 newZoom;

    private Vector3 dragStartPos, dragCurrentPos;//鼠标拖拽的起始点，和鼠标拖拽的当前位置
    private Vector3 rotateStart, rotateCurrent;//鼠标初始位置和当前位置，用来计算相机旋转角度

    private void Start()
    {
        newPos = transform.position;
        newRotation = transform.rotation;

        cameraTrans = transform.GetChild(0);
        newZoom = cameraTrans.localPosition;
    }

    private void Update()
    {
        HandleMovementInput();//通过键盘控制相机
        HandleMouseInput();//通过鼠标控制相机
    }

    private void HandleMouseInput()
    {
        if(Input.GetMouseButtonDown(1))//鼠标按下一瞬间！
        {
            Plane plane = new Plane(Vector3.up, Vector3.zero);
            Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
            float distance;
            if(plane.Raycast(ray, out distance))//out输出参数，一般方法返回一个数值，out则返回return和out数值，2个结果
            {
                dragStartPos = ray.GetPoint(distance);
            }
        }

        if (Input.GetMouseButton(1))//鼠标按着（当前）
        {
            Plane plane = new Plane(Vector3.up, Vector3.zero);
            Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
            float distance;
            if (plane.Raycast(ray, out distance))//out输出参数，一般方法返回一个数值，out则返回return和out数值，2个结果
            {
                dragCurrentPos = ray.GetPoint(distance);

                Vector3 difference = dragStartPos - dragCurrentPos;//大家可以试试反过来写，效果雷同只是方向相反
                newPos = transform.position + difference;
            }
        }

        newZoom += Input.mouseScrollDelta.y * zoomAmount;

        if (Input.GetMouseButtonDown(2))
            rotateStart = Input.mousePosition;
        if(Input.GetMouseButton(2))
        {
            rotateCurrent = Input.mousePosition;
            Vector3 difference = rotateStart - rotateCurrent;

            rotateStart = rotateCurrent;//赋值最新的鼠标位置
            newRotation *= Quaternion.Euler(Vector3.up * -difference.x / 20);//水平方向触发旋转
            //newRotation *= Quaternion.Euler(Vector3.up * -difference.y / 20);//垂直方向
        }
    }

    private void HandleMovementInput()
    {
        if (Input.GetKey(KeyCode.LeftShift))
            panSpeed = fastSpeed;
        else
            panSpeed = normalSpeed;

        if (Input.GetKey(KeyCode.UpArrow) || Input.GetKey(KeyCode.W))
            newPos += transform.forward * panSpeed * Time.deltaTime;//相机平移向上
        if (Input.GetKey(KeyCode.DownArrow) || Input.GetKey(KeyCode.S))
            newPos -= transform.forward * panSpeed * Time.deltaTime;
        if (Input.GetKey(KeyCode.RightArrow) || Input.GetKey(KeyCode.D))
            newPos += transform.right * panSpeed * Time.deltaTime;//相机平移向右
        if(Input.GetKey(KeyCode.LeftArrow) || Input.GetKey(KeyCode.A))
            newPos -= transform.right * panSpeed * Time.deltaTime;

        if (Input.GetKey(KeyCode.Q))
            newRotation *= Quaternion.Euler(Vector3.up * rotationAmount);//Q：逆时针
        if (Input.GetKey(KeyCode.E))
            newRotation *= Quaternion.Euler(Vector3.down * rotationAmount);//(0,-1,0)顺时针

        if (Input.GetKey(KeyCode.R))
            newZoom += zoomAmount;//放大功能：Y越来越小，Z越来越大
        if (Input.GetKey(KeyCode.F))
            newZoom -= zoomAmount;//缩小：Y越来越大，Z越来越小

        //transform.position = newPos;//AxisRaw / Axis
        //Lerp方法：当前位置，目标位置，最大距离：速度 * 时间 =>从当前位置，到目标位置，需要多少时间到达
        transform.position = Vector3.Lerp(transform.position, newPos, moveTime * Time.deltaTime);

        //transform.rotation = newRotation;
        transform.rotation = Quaternion.Lerp(transform.rotation, newRotation, moveTime * Time.deltaTime);

        cameraTrans.localPosition = Vector3.Lerp(cameraTrans.localPosition, newZoom, moveTime * Time.deltaTime);
    }
}
```

rts相机部分代码来自：
https://github.com/zheyuanzhou/EP00_RTSCamera/tree/main
