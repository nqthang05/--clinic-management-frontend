import React, { useState, useEffect, useContext, useRef } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, message, Descriptions, Spin } from 'antd';
import { PlusOutlined, MinusCircleOutlined, EyeOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';

const Prescriptions = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const { user } = useContext(AuthContext);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [form] = Form.useForm();

    const [medicineOptions, setMedicineOptions] = useState([]);
    
    // --- STATE CHO TÌM KIẾM BỆNH ÁN ĐỘNG ---
    const [recordOptions, setRecordOptions] = useState([]);
    const [fetchingRecords, setFetchingRecords] = useState(false);
    const debounceTimeout = useRef(null);

    const fetchData = async (page = 1, size = 5) => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/prescriptions/page?page=${page}&size=${size}`);
            setData(res.data);
            setPagination({ current: res.currentPage, pageSize: res.pageSize, total: res.totalElements });
        } catch (error) { message.error('Lỗi tải đơn thuốc'); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    // Load tất cả thuốc còn hiệu lực vào ô Select
    const loadMedicines = async () => {
        try {
            const res = await axiosClient.get('/medicines/page?page=1&size=500');
            setMedicineOptions(res.data.map(m => ({ value: m.id, label: `${m.name} (Tồn: ${m.stockQuantity} ${m.unit})` })));
        } catch (error) {}
    };

    // --- HÀM TÌM KIẾM BỆNH ÁN ĐỘNG ---
    const searchRecord = (keyword) => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        if (!keyword) { 
            setRecordOptions([]); 
            return; 
        }

        debounceTimeout.current = setTimeout(async () => {
            setFetchingRecords(true);
            try {
                const res = await axiosClient.get(`/medical-records/search?keyword=${keyword}`);
                const options = res.map(r => ({
                    value: r.id,
                    label: `Mã BA: ${r.id} - BN: ${r.patientName} (Khám: ${r.doctorName})`
                }));
                setRecordOptions(options);
            } catch (e) {
                console.error("Lỗi tìm bệnh án", e);
            }
            setFetchingRecords(false);
        }, 500);
    };

    const handleCreate = async (values) => {
        try {
            await axiosClient.post('/prescriptions', values);
            message.success('Kê đơn thuốc thành công!');
            setIsCreateModalOpen(false);
            form.resetFields();
            setRecordOptions([]); // Reset kết quả tìm kiếm
            fetchData();
        } catch (error) { message.error(error.message || 'Lỗi kê đơn'); }
    };

    const columns = [
        { title: 'Mã Đơn Thuốc', dataIndex: 'id', key: 'id' },
        { title: 'Mã Bệnh Án', dataIndex: 'medicalRecordId', key: 'medicalRecordId' },
        { title: 'Hướng dẫn chung', dataIndex: 'instructions', key: 'instructions' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button type="text" style={{ color: '#1890ff' }} icon={<EyeOutlined />} onClick={() => {
                    setSelectedPrescription(record); setIsViewModalOpen(true);
                }}>Xem Chi Tiết</Button>
            ),
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Quản lý Đơn Thuốc</h2>
                {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_DOCTOR') && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { loadMedicines(); setIsCreateModalOpen(true); }}>
                        Kê Đơn Thuốc Mới
                    </Button>
                )}
            </div>
            <Table columns={columns} dataSource={data} rowKey="id" bordered pagination={pagination} loading={loading} onChange={(newPag) => fetchData(newPag.current, newPag.pageSize)} />
            
            <Modal title="Kê Đơn Thuốc" open={isCreateModalOpen} onCancel={() => setIsCreateModalOpen(false)} footer={null} width={800}>
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    
                    {/* ĐÃ SỬA TỪ INPUT_NUMBER SANG SELECT TÌM KIẾM ĐỘNG */}
                    <Form.Item name="medicalRecordId" label="Chọn Bệnh Án" rules={[{ required: true, message: 'Vui lòng chọn Bệnh án' }]}>
                        <Select
                            showSearch
                            placeholder="Gõ tên hoặc SĐT bệnh nhân để tìm bệnh án..."
                            filterOption={false}
                            onSearch={searchRecord}
                            notFoundContent={fetchingRecords ? <Spin size="small" /> : 'Không tìm thấy bệnh án'}
                            options={recordOptions}
                        />
                    </Form.Item>

                    <Form.Item name="instructions" label="Lời dặn chung">
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <div style={{ marginBottom: 16, fontWeight: 'bold' }}>Chi Tiết Thuốc Kê:</div>
                    <Form.List name="details">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item {...restField} name={[name, 'medicineId']} rules={[{ required: true, message: 'Chọn thuốc' }]}>
                                            <Select showSearch placeholder="Chọn Thuốc" options={medicineOptions} style={{ width: 250 }} filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}/>
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true, message: 'Số lượng' }]}>
                                            <InputNumber placeholder="SL" min={1} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'dosage']} rules={[{ required: true, message: 'Liều dùng' }]}>
                                            <Input placeholder="Cách dùng (VD: Ngày 2 viên)" style={{ width: 200 }} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'durationDays']} rules={[{ required: true, message: 'Số ngày' }]}>
                                            <InputNumber placeholder="Số ngày" min={1} />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm Thuốc Vào Đơn</Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                    <Form.Item><Button type="primary" htmlType="submit" block size="large">Hoàn Tất Kê Đơn</Button></Form.Item>
                </Form>
            </Modal>

            <Modal title="Chi Tiết Đơn Thuốc" open={isViewModalOpen} onCancel={() => setIsViewModalOpen(false)} footer={null} width={700}>
                {selectedPrescription && (
                    <>
                        <Descriptions bordered column={1} size="small" style={{ marginBottom: 20 }}>
                            <Descriptions.Item label="Mã Đơn">{selectedPrescription.id}</Descriptions.Item>
                            <Descriptions.Item label="Mã Bệnh Án">{selectedPrescription.medicalRecordId}</Descriptions.Item>
                            <Descriptions.Item label="Lời Dặn">{selectedPrescription.instructions}</Descriptions.Item>
                        </Descriptions>
                        <Table 
                            dataSource={selectedPrescription.details} 
                            rowKey="id" 
                            pagination={false} 
                            columns={[
                                { title: 'Tên Thuốc', dataIndex: 'medicineName', key: 'medicineName' },
                                { title: 'Số Lượng', dataIndex: 'quantity', key: 'quantity' },
                                { title: 'Cách Dùng', dataIndex: 'dosage', key: 'dosage' },
                                { title: 'Số Ngày', dataIndex: 'durationDays', key: 'durationDays' },
                            ]}
                        />
                    </>
                )}
            </Modal>
        </div>
    );
};
export default Prescriptions;