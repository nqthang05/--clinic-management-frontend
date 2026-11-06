import React, { useState, useEffect, useContext, useRef } from 'react';
import { Table, Button, Modal, Form, Select, message, Tag, Popconfirm, Spin } from 'antd';
import { DollarOutlined, FileAddOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';

const Invoices = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const { user } = useContext(AuthContext);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [form] = Form.useForm();

    // --- STATE CHO TÌM KIẾM LỊCH HẸN ĐỘNG ---
    const [appointmentOptions, setAppointmentOptions] = useState([]);
    const [fetchingAppointments, setFetchingAppointments] = useState(false);
    const debounceTimeout = useRef(null);

    const fetchData = async (page = 1, size = 5) => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/invoices/page?page=${page}&size=${size}`);
            setData(res.data);
            setPagination({ current: res.currentPage, pageSize: res.pageSize, total: res.totalElements });
        } catch (error) { message.error('Lỗi tải hóa đơn'); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    // --- HÀM TÌM KIẾM LỊCH HẸN ĐỘNG ---
    const searchAppointment = (keyword) => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        if (!keyword) { 
            setAppointmentOptions([]); 
            return; 
        }

        debounceTimeout.current = setTimeout(async () => {
            setFetchingAppointments(true);
            try {
                const res = await axiosClient.get(`/appointments/search?keyword=${keyword}`);
                const options = res.map(a => ({
                    value: a.id,
                    label: `Mã Lịch: ${a.id} - BN: ${a.patientName} (Ngày: ${a.appointmentDate})`
                }));
                setAppointmentOptions(options);
            } catch (e) {
                console.error("Lỗi tìm lịch hẹn", e);
            }
            setFetchingAppointments(false);
        }, 500);
    };

    const handleGenerate = async (values) => {
        try {
            await axiosClient.post(`/invoices/generate/${values.appointmentId}`);
            message.success('Xuất hóa đơn thành công!');
            setIsCreateModalOpen(false);
            form.resetFields();
            setAppointmentOptions([]); // Reset kết quả tìm kiếm
            fetchData();
        } catch (error) { message.error(error.message || 'Lịch hẹn đã có hóa đơn hoặc bị lỗi!'); }
    };

    const handlePay = async (invoiceId, paymentMethod) => {
        try {
            await axiosClient.put(`/invoices/${invoiceId}/pay?method=${paymentMethod}`);
            message.success('Thanh toán thành công!');
            fetchData(pagination.current, pagination.pageSize);
        } catch (error) { message.error(error.message || 'Lỗi thanh toán'); }
    };

    const columns = [
        { title: 'Mã HĐ', dataIndex: 'id', key: 'id' },
        { title: 'Mã Lịch Hẹn', dataIndex: 'appointmentId', key: 'appointmentId' },
        { title: 'Tiền Khám', dataIndex: 'consultationFee', key: 'consultationFee', render: v => `${v.toLocaleString()} đ` },
        { title: 'Tiền Thuốc', dataIndex: 'medicineFee', key: 'medicineFee', render: v => `${v.toLocaleString()} đ` },
        { title: 'TỔNG CỘNG', dataIndex: 'totalAmount', key: 'totalAmount', render: v => <strong style={{ color: 'red' }}>{v.toLocaleString()} đ</strong> },
        { 
            title: 'Trạng Thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => <Tag color={status === 'PAID' ? 'green' : 'red'}>{status}</Tag>
        },
        { title: 'Phương Thức', dataIndex: 'paymentMethod', key: 'paymentMethod' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => record.status === 'UNPAID' ? (
                <Popconfirm 
                    title="Khách thanh toán Tiền Mặt hay Chuyển Khoản?" 
                    onConfirm={() => handlePay(record.id, 'CASH')} 
                    onCancel={() => handlePay(record.id, 'BANK_TRANSFER')}
                    okText="Tiền Mặt" 
                    cancelText="Chuyển Khoản"
                >
                    <Button type="primary" style={{ background: '#52c41a' }} icon={<DollarOutlined />}>Thanh Toán</Button>
                </Popconfirm>
            ) : <span style={{ color: 'green', fontWeight: 'bold' }}>Đã hoàn tất</span>,
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Quản lý Hóa Đơn</h2>
                {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_RECEPTIONIST') && (
                    <Button type="primary" icon={<FileAddOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                        Tạo Hóa Đơn Tự Động
                    </Button>
                )}
            </div>
            <Table columns={columns} dataSource={data} rowKey="id" bordered pagination={pagination} loading={loading} onChange={(newPag) => fetchData(newPag.current, newPag.pageSize)} />
            
            <Modal title="Tạo Hóa Đơn Từ Lịch Hẹn" open={isCreateModalOpen} onCancel={() => setIsCreateModalOpen(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleGenerate}>
                    
                    {/* ĐÃ SỬA TỪ INPUT_NUMBER SANG SELECT TÌM KIẾM ĐỘNG */}
                    <Form.Item name="appointmentId" label="Tìm Lịch Hẹn" rules={[{ required: true, message: 'Vui lòng chọn Lịch hẹn' }]}>
                        <Select
                            showSearch
                            placeholder="Gõ tên hoặc SĐT bệnh nhân để xuất hóa đơn..."
                            filterOption={false}
                            onSearch={searchAppointment}
                            notFoundContent={fetchingAppointments ? <Spin size="small" /> : 'Không tìm thấy lịch hẹn'}
                            options={appointmentOptions}
                        />
                    </Form.Item>

                    <div style={{ color: 'gray', marginBottom: 20 }}>
                        * Hệ thống sẽ tự động tổng hợp phí khám của Bác sĩ và tiền thuốc từ Bệnh án của lịch hẹn này.
                    </div>
                    <Form.Item><Button type="primary" htmlType="submit" block>Xuất Hóa Đơn</Button></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
export default Invoices;