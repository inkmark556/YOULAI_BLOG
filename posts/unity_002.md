# 报错信息
描述：在直接导入Google.Protobuf.dll时会出现以下两个报错信息
1.Assembly 'Library/ScriptAssemblies/Assembly-CSharp.dll' will not be loaded due to errors:
Reference has errors 'Google.Protobuf'.
2.Assembly 'Assets/Plugins/Google.Protobuf.dll' will not be loaded due to errors:
Unable to resolve reference 'System.Runtime.CompilerServices.Unsafe'. Is the assembly missing or incompatible with the current platform?
Reference validation can be disabled in the Plugin Inspector.
# 报错原因
Google.Protobuf.dll 里面有的依赖并不是UnityEditor里面的版本，所以就会出现unity报错，但是VS2022内不报错的情况
# 解决方法
下载Google Protobuf 的开源代码使用VS2022生成解决方案，再把bin>Debug>net45文件夹内容全部一起导入unity即可
下载地址：https://github.com/protocolbuffers/protobuf/releases


