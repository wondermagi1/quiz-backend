<template>
  <div>
    <el-header style="background:#409EFF;color:#fff;font-size:28px;line-height:60px;padding-left:20px;">
      Quiz后台管理
    </el-header>
    <el-container>
      <el-aside width="160px" style="background:#fff;min-height:calc(100vh - 60px);border-right:1px solid #eee;">
        <el-menu default-active="$route.path" router unique-opened>
          <el-submenu index="1">
            <template slot="title">
              <span>管理选项</span>
            </template>
            <el-menu-item index="/user">用户管理</el-menu-item>
            <el-menu-item index="/quiz">题目管理</el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>
