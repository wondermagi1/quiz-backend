<template>
  <div>
    <div style="margin-bottom:20px;">
      <span>用户名</span>
      <el-input v-model="searchName" placeholder="用户名" style="width:200px;margin:0 10px;"></el-input>
      <el-button type="primary" @click="handleSearch">查询用户</el-button>
      <el-button type="success" @click="dialogVisible = true">添加用户</el-button>
    </div>

    <el-table :data="tableData" border style="width:100%">
      <el-table-column prop="date" label="日期" width="180">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left:5px;">{{ scope.row.date }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="用户名" width="180">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="password" label="密码"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="">
          <el-button size="mini" @click="handleClick">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleClick">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top:20px;"
      layout="prev, pager, next"
      :total="1000"
      :page-size="10">
    </el-pagination>

    <el-dialog title="新用户" :visible.sync="dialogVisible" width="40%">
      <el-form label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="初始密码">
          <el-input v-model="form.password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.confirmPassword"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchName: '',
      dialogVisible: false,
      form: {
        username: '',
        password: '',
        confirmPassword: ''
      },
      tableData: [
        { date: '2016-05-02', name: '王小虎', password: '123456' },
        { date: '2016-05-04', name: '王小虎', password: '123456' },
        { date: '2016-05-01', name: '王小虎', password: '123456' },
        { date: '2016-05-03', name: '王小虎', password: '123456' }
      ]
    }
  },
  methods: {
    handleSearch() {},
    handleClick() {}
  }
}
</script>