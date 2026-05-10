# iOS 打包 IPA 指南 - Codemagic + Windows

## 准备工作（必须先完成）

### 1. Apple Developer Account（$99/年 = ¥688/年）

iOS 应用必须使用有效的签名证书才能安装到真机上，这是 Apple 强制的，无法绕过。

**注册地址**：https://developer.apple.com/programs/enroll/

---

## 第一部分：创建 iOS 签名证书（Windows 可完成）

### 步骤 1.1：安装 OpenSSL for Windows

1. 下载 OpenSSL：https://slproweb.com/products/Win32OpenSSL.html
2. 安装时选择 "The Windows system directory"
3. 安装完成后，添加路径到系统 PATH

### 步骤 1.2：创建 CSR 文件（Certificate Signing Request）

1. 打开命令提示符（CMD），运行：
```bash
openssl version -a
```

2. 创建私钥：
```bash
openssl genrsa -out private.key 2048
```

3. 创建 CSR 文件：
```bash
openssl req -new -key private.key -out CertificateSigningRequest.certSigningRequest -subj "/emailAddress=your@email.com/CN=Your Name/C=US"
```
**注意**：将 emailAddress、CN（你的名字）、C（国家代码，中国=CN）替换为你自己的信息

### 步骤 1.3：在 Apple Developer Portal 创建证书

1. 登录 https://developer.apple.com
2. 进入 "Certificates, Identifiers & Profiles"
3. 点击 "+" 创建新证书
4. 选择 "iOS Distribution (App Store and Ad Hoc)"
5. 上传你创建的 `.certSigningRequest` 文件
6. 下载生成的证书（`.cer` 文件）

### 步骤 1.4：将 .cer 转换为 .p12

在 Windows 上，Apple 颁发的证书是 .cer 格式，需要转换为 .p12 格式才能用于 Codemagic：

1. 首先，将 .cer 转换为 PEM：
```bash
openssl x509 -in ios_distribution.cer -inform DER -out cert.pem -outform PEM
```

2. 合并私钥和证书为 .p12：
```bash
openssl pkcs12 -export -out ios_distribution.p12 -inkey private.key -in cert.pem
```
**注意**：创建 .p12 时会要求设置密码，**必须记住这个密码**！

### 步骤 1.5：创建 App ID

1. 在 Apple Developer Portal 进入 "Identifiers"
2. 点击 "+"
3. 选择 "App IDs" -> "App"
4. 填写：
   - Description: `Habit`
   - Bundle ID: `com.ycy.habit`（必须与 capacitor.config.ts 中的 appId 一致）
5. 点击 "Register"

### 步骤 1.6：创建 Provisioning Profile

1. 在 Apple Developer Portal 进入 "Profiles"
2. 点击 "+"
3. 选择 "Ad Hoc"（用于测试分发）
4. 选择你的 App ID（`com.ycy.habit`）
5. 选择你的 iOS Distribution 证书
6. 选择要支持的设备（Ad Hoc 最多支持 100 台设备）
7. 输入 Profile Name: `Habit Ad Hoc`
8. 点击 "Generate"
9. 下载生成的 `.mobileprovision` 文件

---

## 第二部分：配置 Codemagic

### 步骤 2.1：注册 Codemagic

1. 访问 https://codemagic.io
2. 使用 GitHub 账号登录（推荐）
3. 完成初始设置

### 步骤 2.2：上传签名文件到 Codemagic

1. 在 Codemagic 面板，进入 "Teams" -> "Settings"
2. 找到 "Code signing" 部分
3. 上传以下文件：
   - `ios_distribution.p12`（证书）
   - `Habit Ad Hoc.mobileprovision`（Provisioning Profile）
4. 记录 Codemagic 生成的 **Certificate ID** 和 **Profile ID**

### 步骤 2.3：连接 GitHub 仓库

1. 在 Codemagic 面板，点击 "Add application"
2. 选择你的 GitHub 仓库
3. 选择分支（通常是 `main` 或 `master`）
4. Codemagic 会自动检测为 Capacitor 项目

### 步骤 2.4：配置环境变量

在 Codemagic 的 "Environment variables" 中添加：

| Name | Value |
|------|-------|
| `CERTIFICATE_ID` | 你在 Codemagic 中记录的 Certificate ID |
| `PROVISIONING_PROFILE_ID` | 你在 Codemagic 中记录的 Profile ID |
| `CERTIFICATE_PASSWORD` | 你创建 .p12 时设置的密码 |

---

## 第三部分：修改 Codemagic 工作流

我已为你创建了 `codemagic.yaml` 和 `ExportOptions.plist`，你可能需要根据实际情况调整。

### 更新 ExportOptions.plist

将 `ios/App/App/ExportOptions.plist` 中的 `YOUR_TEAM_ID` 替换为你的 Apple Team ID（在 Apple Developer Portal 的 Membership 页面可以找到）。

---

## 第四部分：推送到 GitHub 并触发构建

### 4.1 提交配置文件到 GitHub

```bash
git add codemagic.yaml ios/App/App/ExportOptions.plist
git commit -m "Add Codemagic configuration"
git push origin main
```

### 4.2 在 Codemagic 触发构建

1. 回到 Codemagic 面板
2. 选择你的应用
3. 点击 "Start new build"
4. 选择分支，点击 "Start build"

### 4.3 下载 IPA

构建完成后，在 "Artifacts" 标签页可以下载生成的 `.ipa` 文件。

---

## 常见问题

### Q1: Ad Hoc 和 App Store 的区别？

- **Ad Hoc**：可以安装到最多 100 台已注册设备上，用于测试
- **App Store**：需要 Apple 审核，用于正式发布

### Q2: 构建失败怎么办？

检查 Codemagic 构建日志：
- 证书/Profile 是否正确配置
- Team ID 是否正确
- Bundle ID 是否匹配

### Q3: 如何更新已安装的测试 App？

每次修改后都需要：
1. 重新构建
2. 下载新的 IPA
3. 通过 Xcode 或 iTunes 重新安装

---

## 文件清单

创建/修改的文件：
- ✅ `codemagic.yaml` - Codemagic 工作流配置
- ✅ `ios/App/App/ExportOptions.plist` - Xcode 导出选项