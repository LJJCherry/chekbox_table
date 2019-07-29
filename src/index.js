import React from "react";
import ReactDOM from "react-dom";
import "antd/dist/antd.css";
import "./index.css";
import { Table, Checkbox } from "antd";
import reqwest from "reqwest";

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    render: name => `${name.first} ${name.last}`,
    width: "20%"
  },
  {
    title: "Gender",
    dataIndex: "gender",
    width: "20%"
  },
  {
    title: "Email",
    dataIndex: "email"
  }
];

class App extends React.Component {
  state = {
    data: [],
    pagination: {},
    loading: false,
    selectedNum: 0,
    selectedRowKeys: []
  };

  pageList = [];

  componentDidMount() {
    this.fetch();
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.fetch({
      results: pagination.pageSize,
      page: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters
    });
  };

  fetch = (params = {}) => {
    console.log("params:", params);
    this.setState({ loading: true });
    reqwest({
      url: "https://randomuser.me/api",
      method: "get",
      data: {
        results: 10,
        seed: "foobar",
        ...params
      },
      type: "json"
    }).then(data => {
      const pagination = { ...this.state.pagination };
      // Read total count from server
      // pagination.total = data.totalCount;
      const { selectedAll, selectedRowKeys } = this.state;
      let newData = data.results;
      if (selectedAll) {
        if (this.pageList.indexOf(data.info.page) === -1) {
          newData.forEach(item => {
            if (selectedRowKeys.indexOf(item.login.uuid) === -1) {
              selectedRowKeys.push(item.login.uuid);
            }
          });
          this.pageList.push(data.info.page);
        }
      }
      console.log("pageList", this.pageList);

      pagination.total = 200;
      this.setState({
        loading: false,
        data: newData,
        pagination,
        selectedRowKeys
      });
    });
  };

  onChange = e => {
    const { data, selectedRowKeys } = this.state;
    // if(e.target.checked) {
    let newData = data.map(item => ({
      ...item,
      checked: e.target.checked
    }));
    // }
    // 保存当前页面的page
    this.pageList.push(1);
    if (e.target.checked) {
      this.setState({
        selectedNum: this.state.pagination.total,
        selectedRowKeys: data.map(item => item.login.uuid)
      });
    } else {
      this.setState({
        selectedRowKeys: [],
        selectedNum: 0
      });
      this.pageList = [];
    }
    this.setState({
      selectedAll: e.target.checked,
      data: newData
    });
    console.log("e.target.checked", e.target.checked);
  };

  onSelect = (record, selected, selectedRows) => {
    // 选中
    console.log("selected", selected);
    let { selectedRowKeys, selectedNum } = this.state;
    let index = selectedRowKeys.indexOf(record.login.uuid);
    if (selected) {
      if (index === -1) {
        selectedRowKeys.push(record.login.uuid);
        selectedNum = selectedNum + 1;
      }
    } else {
      if (index !== -1) {
        selectedRowKeys.splice(index, 1);
        selectedNum = selectedNum - 1;
      }
    }
    this.setState({
      selectedRowKeys,
      selectedNum
    });
  };

  onSelectAll = (selected, selectedRows, changeRows) => {
    console.log("selectedRows", selectedRows);
    console.log("changeRows", changeRows);
    let { selectedRowKeys, selectedNum } = this.state;
    let num = 0;
    if (selected) {
      selectedRows.forEach(item => {
        const index = selectedRowKeys.indexOf(item.login.uuid);
        if (index === -1) {
          selectedRowKeys.push(item.login.uuid);
          num = num + 1;
        }
      });
      selectedNum = selectedNum + num;
    } else {
      changeRows.forEach(item => {
        const index = selectedRowKeys.indexOf(item.login.uuid);
        if (index > -1) {
          selectedRowKeys.splice(index, 1);
          num = num + 1;
        }
      });
      selectedNum = selectedNum - 10;
    }
    this.setState({
      selectedRowKeys,
      selectedNum
    });
  };

  render() {
    const { pagination, data, selectedNum, selectedRowKeys } = this.state;
    console.log("selectedRowKeys", selectedRowKeys);
    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onSelectAll: this.onSelectAll,
      onSelect: this.onSelect,
      getCheckboxProps: record => ({
        disabled: record.name === "Disabled User", // Column configuration not to be checked
        name: record.name
      })
    };
    return (
      <div>
        <Checkbox onChange={this.onChange}>{`已选择${selectedNum}/${
          pagination.total
        }`}</Checkbox>
        <Table
          columns={columns}
          rowSelection={rowSelection}
          rowKey={record => record.login.uuid}
          dataSource={this.state.data}
          pagination={this.state.pagination}
          loading={this.state.loading}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("container"));
