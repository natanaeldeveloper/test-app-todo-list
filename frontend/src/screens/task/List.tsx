import React, { useEffect, useState } from 'react';
import { Button, Input, Space, Table, Avatar, message, Tag } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { FilterDropdownProps, SorterResult } from 'antd/es/table/interface';
import { SearchOutlined, DeleteOutlined, EditOutlined, CalendarOutlined } from '@ant-design/icons'
import TextHighlight from 'react-highlight-words';
import api from '../../services/api';

interface DataType {
  id: string;
  description: string;
  data_conclusion: string;
  created_at: string;
  responsible: {
    name: string;
    email: string;
  }
}

type DataIndex = keyof DataType;

const App: React.FC = () => {

  const [messageApi, contextHolder] = message.useMessage()
  const [data, setData] = useState<DataType[]>();
  const [loading, setLoading] = useState(false);
  const [searchedColumn, setSearchedColumn] = useState('');
  const [searchedText, setSearchedText] = useState('');
  const [tableParams, setTableParams] = useState<TableProps<DataType>>();

  const getColumnSearchProps = (dataIndex: DataIndex, type: 'text' | 'date') => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          style={{ marginBottom: 8, display: 'block' }}
          type={type}
          placeholder={`Filtro...`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => {
            confirm
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => {
              confirm({ closeDropdown: true })
              setSearchedColumn(dataIndex)
              setSearchedText((selectedKeys as string[])[0])
            }}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={clearFilters}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={close}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
  });

  const columns: ColumnsType<DataType> = [
    {
      title: 'Descrição',
      dataIndex: 'description',
      width: '30%',
      render: (text) => (
        searchedColumn === 'description' ? (
          <TextHighlight
            searchWords={[searchedText]}
            textToHighlight={text}
          />
        ) : (
          text
        )
      ),
      ...getColumnSearchProps('description', 'text')
    },
    {
      title: 'Responsável',
      dataIndex: 'responsible',
      sorter: true,
      width: '25%',
      render: (_, record) => {
        const abb = record.responsible.name.split(' ').map((item: string) => item[0])
        abb.length = 2
        return (
          <Space>
            <Avatar>{abb}</Avatar>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>
                {searchedColumn === 'responsible' ? (
                  <TextHighlight
                    searchWords={[searchedText]}
                    textToHighlight={record.responsible.name}
                  />
                ) : (
                  record.responsible.name
                )}
              </span>
              <Tag>
                {
                  searchedColumn === 'responsible' ? (
                    <TextHighlight
                      searchWords={[searchedText]}
                      textToHighlight={record.responsible.email}
                    />
                  ) : (
                    record.responsible.email
                  )
                }
              </Tag>
            </div>
          </Space>
        )
      },
      ...getColumnSearchProps('responsible', 'text')
    },
    {
      title: 'Data conclusão',
      dataIndex: 'date_conclusion',
      width: '15%',
      sorter: true,
      render: (value) => (
        <Space>
          <CalendarOutlined style={{ color: 'grey' }} />
          <span>{value}</span>
        </Space>
      ),
      ...getColumnSearchProps('data_conclusion', 'date')
    },
    {
      title: 'Data Criação',
      dataIndex: 'created_at',
      width: '15%',
      sorter: true,
      render: (value) => (
        <Space>
          <CalendarOutlined style={{ color: 'grey' }} />
          <span>{value}</span>
        </Space>
      ),
      ...getColumnSearchProps('data_conclusion', 'date')
    },
    {
      title: 'Ação',
      dataIndex: 'action',
      align: 'center',
      width: '15%',
      render: () => (
        <Space>
          <Button shape='circle' size='middle'><EditOutlined /></Button>
          <Button shape='circle' size='middle'><DeleteOutlined /></Button>
        </Space>
      )
    },
  ];

  useEffect(() => {
    fetchData({});
  }, []);

  const fetchData = (params: object) => {
    setLoading(true)
    api.get('tasks', params)
      .then((res) => res.data)
      .then((res) => {
        setData(res.data)
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams?.pagination,
            pageSize: res.per_page,
            current: res.current_page,
            total: res.total,
          },
        })
      })
      .catch(error => {
        messageApi.error({
          type: 'error',
          content: error.response.data.message
        })
      })
      .finally(() => setLoading(false))
  };

  const handleTableChange: TableProps<DataType>['onChange'] = (
    pagination,
    filters,
    sorter
  ) => {

    var newSorter: SorterResult<DataType> = {}

    if (!Array.isArray(sorter)) {
      newSorter.field = sorter.field
      newSorter.order = sorter.order
    }

    fetchData({
      params: {
        page: pagination.current,
        per_page: pagination.pageSize,
        sorter: newSorter,
        filters,
      }
    })
  };

  return (
    <>
      {contextHolder}
      <Table
        size='small'
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={data}
        pagination={tableParams?.pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </>
  );
};

export default App;