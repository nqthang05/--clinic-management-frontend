import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Tag, Space, Descriptions, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';

// Danh sách chuyên khoa chuẩn Y tế
const MEDICAL_SPECIALTIES = [
    'Nội khoa', 'Ngoại khoa', 'Nhi khoa', 'Sản phụ khoa', 
    'Tai Mũi Họng', 'Răng Hàm Mặt', 'Da liễu', 'Nhãn khoa (Mắt)', 
    'Thần kinh', 'Tim mạch', 'Cơ xương khớp', 'Tiêu hóa', 
    'Hô hấp', 'Chẩn đoán hình ảnh', 'Xét nghiệm'
];

const Doctors = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const { user } = useContext(AuthContext);

    // States quản lý các Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const fetchData = async (page = 1, size = 5) => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/doctors/page?page=${page}&size=${size}`);
            setData(res.data);
            setPagination({ current: res.currentPage, pageSize: res.pageSize, total: res.totalElements });
        } catch (error) {
            message.error('Lỗi khi tải danh sách Bác sĩ');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ================= XỬ LÝ TẠO MỚI (ALL-IN-ONE) =================
    const handleCreate = async (values) => {
        try {
            // Bước 1: Gọi API tạo User trước (Role 3 là ROLE_DOCTOR trong DB của bạn)
            const userPayload = {
                username: values.username,
                password: values.password,
                fullName: values.fullName,
                email: values.email,
                phone: values.phone,
                roleId: 3 // Hardcode Role Bác sĩ
            };
            
            const createdUser = await axiosClient.post('/users', userPayload);

            // Bước 2: Lấy UserID vừa tạo để gọi API tạo Doctor
            const doctorPayload = {
                userId: createdUser.id,
                specialty: values.specialty,
                experienceYears: values.experienceYears,
                consultationFee: values.consultationFee
            };

            await axiosClient.post('/doctors', doctorPayload);

            message.success('Tạo hồ sơ Bác sĩ thành công!');
            setIsCreateModalOpen(false);
            createForm.resetFields();
            fetchData(1, pagination.pageSize);
        } catch (error) {
            message.error(error.message || 'Lỗi khi tạo hồ sơ. Username/Email có thể đã tồn tại!');
        }
    };

    // ================= XỬ LÝ CẬP NHẬT =================
    const openEditModal = (record) => {
        setSelectedDoctor(record);
        editForm.setFieldsValue({
            userId: record.userId, // Cần truyền lại userId cũ cho backend
            specialty: record.specialty,
            experienceYears: record.experienceYears,
            consultationFee: record.consultationFee
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (values) => {
        try {
            await axiosClient.put(`/doctors/${selectedDoctor.id}`, values);
            message.success('Cập nhật thông tin Bác sĩ thành công!');
            setIsEditModalOpen(false);
            fetchData(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error(error.message || 'Lỗi khi cập nhật!');
        }
    };

    // ================= XỬ LÝ XÓA =================
    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/doctors/${id}`);
            message.success('Đã xóa hồ sơ Bác sĩ!');
            fetchData(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error(error.message || 'Lỗi khi xóa!');
        }
    };

    // ================= XEM CHI TIẾT =================
    const openViewModal = (record) => {
        setSelectedDoctor(record);
        setIsViewModalOpen(true);
    };

    const columns = [
        { title: 'Mã BS', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Tên Bác Sĩ', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Chuyên khoa', dataIndex: 'specialty', key: 'specialty' },
        { title: 'Kinh nghiệm', dataIndex: 'experienceYears', key: 'experienceYears', render: (y) => `${y} năm` },
        { 
            title: 'Phí Khám', 
            dataIndex: 'consultationFee', 
            key: 'consultationFee',
            render: (fee) => <Tag color="gold">{fee.toLocaleString()} VNĐ</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="text" style={{ color: '#1890ff' }} icon={<EyeOutlined />} onClick={() => openViewModal(record)}>Xem</Button>
                    
                    {/* Chỉ Admin mới được sửa / xóa */}
                    {user?.role === 'ROLE_ADMIN' && (
                        <>
                            <Button type="text" style={{ color: '#faad14' }} icon={<EditOutlined />} onClick={() => openEditModal(record)}>Sửa</Button>
                            <Popconfirm title="Bạn có chắc chắn muốn xóa bác sĩ này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                                <Button type="text" danger icon={<DeleteOutlined />}>Xóa</Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Danh sách Bác Sĩ</h2>
                {user?.role === 'ROLE_ADMIN' && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                        Thêm Bác Sĩ Mới
                    </Button>
                )}
            </div>

            <Table 
                columns={columns} 
                dataSource={data} 
                rowKey="id" 
                bordered 
                pagination={pagination}
                loading={loading}
                onChange={(newPag) => fetchData(newPag.current, newPag.pageSize)} 
            />

            {/* MODAL TẠO MỚI BÁC SĨ (ALL IN ONE) */}
            <Modal title="Thêm Bác Sĩ Mới (Tạo Tài Khoản & Hồ Sơ)" open={isCreateModalOpen} onCancel={() => setIsCreateModalOpen(false)} footer={null} width={600}>
                <Form form={createForm} layout="vertical" onFinish={handleCreate}>
                    <h4 style={{ color: '#1890ff', borderBottom: '1px solid #e8e8e8', paddingBottom: 8 }}>1. Thông tin Tài Khoản Đăng Nhập</h4>
                    <Space style={{ display: 'flex' }} size="large">
                        <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]} style={{ width: 260 }}>
                            <Input placeholder="VD: doctor_nam" />
                        </Form.Item>
                        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]} style={{ width: 260 }}>
                            <Input.Password placeholder="Nhập mật khẩu" />
                        </Form.Item>
                    </Space>
                    <Form.Item name="fullName" label="Họ Tên Bác Sĩ" rules={[{ required: true }]}>
                        <Input placeholder="VD: Nguyễn Văn Nam" />
                    </Form.Item>
                    <Space style={{ display: 'flex' }} size="large">
                        <Form.Item name="email" label="Email (Không bắt buộc)" style={{ width: 260 }}>
                            <Input type="email" placeholder="nam@clinic.com" />
                        </Form.Item>
                        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]} style={{ width: 260 }}>
                            <Input placeholder="09xxxx" />
                        </Form.Item>
                    </Space>

                    <h4 style={{ color: '#52c41a', borderBottom: '1px solid #e8e8e8', paddingBottom: 8, marginTop: 16 }}>2. Thông tin Chuyên Môn</h4>
                    <Form.Item name="specialty" label="Chuyên khoa" rules={[{ required: true }]}>
                        <Select
                            showSearch
                            placeholder="Chọn hoặc gõ tìm chuyên khoa"
                            options={MEDICAL_SPECIALTIES.map(s => ({ value: s, label: s }))}
                        />
                    </Form.Item>
                    <Space style={{ display: 'flex' }} size="large">
                        <Form.Item name="experienceYears" label="Kinh nghiệm (Năm)" rules={[{ required: true }]} style={{ width: 260 }}>
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                        <Form.Item name="consultationFee" label="Phí khám (VNĐ)" rules={[{ required: true }]} style={{ width: 260 }}>
                            <InputNumber style={{ width: '100%' }} min={0} step={50000} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </Space>

                    <Form.Item style={{ marginTop: 24 }}>
                        <Button type="primary" htmlType="submit" block size="large">Xác Nhận Tạo Mới</Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* MODAL CHỈNH SỬA THÔNG TIN CHUYÊN MÔN */}
            <Modal title="Chỉnh Sửa Thông Tin Chuyên Môn" open={isEditModalOpen} onCancel={() => setIsEditModalOpen(false)} footer={null}>
                <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
                    {/* Trường ẩn để gửi userId cũ lên API */}
                    <Form.Item name="userId" hidden><Input /></Form.Item>
                    
                    <Form.Item name="specialty" label="Chuyên khoa" rules={[{ required: true }]}>
                        <Select showSearch options={MEDICAL_SPECIALTIES.map(s => ({ value: s, label: s }))} />
                    </Form.Item>
                    <Form.Item name="experienceYears" label="Số năm kinh nghiệm" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                    <Form.Item name="consultationFee" label="Phí khám (VNĐ)" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={0} step={50000} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>Lưu Thay Đổi</Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* MODAL XEM CHI TIẾT */}
            <Modal title="Chi Tiết Hồ Sơ Bác Sĩ" open={isViewModalOpen} onCancel={() => setIsViewModalOpen(false)} footer={[ <Button key="close" onClick={() => setIsViewModalOpen(false)}>Đóng</Button> ]}>
                {selectedDoctor && (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Mã BS (ID)">{selectedDoctor.id}</Descriptions.Item>
                        <Descriptions.Item label="Họ Tên">{selectedDoctor.fullName}</Descriptions.Item>
                        <Descriptions.Item label="Chuyên Khoa"><Tag color="blue">{selectedDoctor.specialty}</Tag></Descriptions.Item>
                        <Descriptions.Item label="Kinh Nghiệm">{selectedDoctor.experienceYears} năm</Descriptions.Item>
                        <Descriptions.Item label="Phí Khám">
                            <span style={{ color: '#d48806', fontWeight: 'bold' }}>
                                {selectedDoctor.consultationFee.toLocaleString()} VNĐ
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng Thái">
                            {selectedDoctor.isActive ? <Tag color="green">Đang công tác</Tag> : <Tag color="red">Đã nghỉ</Tag>}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default Doctors;