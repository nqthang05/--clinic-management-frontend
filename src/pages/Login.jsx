import React, { useContext, useState } from 'react';
import { Form, Input, Button, message, Row, Col, Typography, Space } from 'antd';
import { 
    UserOutlined, LockOutlined, ArrowRightOutlined, SafetyCertificateOutlined,
    CalendarOutlined, MedicineBoxOutlined, ReconciliationOutlined, HeartOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        const res = await login(values.username, values.password);
        if (res.success) {
            message.success('Đăng nhập hệ thống thành công!');
            navigate('/');
        } else {
            message.error(res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
            setLoading(false);
        }
    };

    const themeColors = {
        primary: '#3a7668',
        bgLeft: '#295b50',
        inputBg: '#f7f9fa'
    };

    return (
        <Row style={{ height: '100vh', width: '100vw', overflow: 'hidden', textAlign: 'left' }}>
            
            {/* ================= BÊN TRÁI ================= */}
            <Col xs={0} md={12} lg={13} style={{ 
                backgroundColor: themeColors.bgLeft, 
                padding: '30px 40px', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'space-between',
                color: 'white'
            }}>
                {/* Header Trái */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HeartOutlined style={{ fontSize: '24px', color: '#68d391' }} />
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>CLINIC PRO</div>
                            <div style={{ fontSize: '10px', color: '#a0aec0', marginTop: '4px', letterSpacing: '1px' }}>HEALTHCARE PLATFORM</div>
                        </div>
                    </div>
                    <div style={{ border: '1px solid rgba(255,255,255,0.3)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                        <SafetyCertificateOutlined /> Bảo mật chuẩn Y tế
                    </div>
                </div>

                {/* Nội dung chính Trái */}
                <div style={{ maxWidth: '550px', margin: '0 auto', textAlign: 'left' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px', color: 'white' }}>
                        Số hóa quy trình khám <br/> chữa bệnh toàn diện.
                    </h1>
                    <p style={{ fontSize: '14px', color: '#cbd5e0', lineHeight: 1.6, marginBottom: '30px' }}>
                        Kết nối liên mạch từ khâu tiếp đón bệnh nhân, điều phối lịch hẹn bác sĩ, 
                        kê đơn thuốc lâm sàng cho đến tự động đối soát viện phí chỉ trên một nền tảng duy nhất.
                    </p>

                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div style={featureCardStyle}>
                            <CalendarOutlined style={featureIconStyle} />
                            <div>
                                <div style={featureTitleStyle}>Điều phối Lịch hẹn Chống trùng ca</div>
                                <div style={featureDescStyle}>Kiểm soát xung đột lịch trình hai chiều giữa Bác sĩ và Bệnh nhân theo thời gian thực.</div>
                            </div>
                        </div>
                        <div style={featureCardStyle}>
                            <MedicineBoxOutlined style={featureIconStyle} />
                            <div>
                                <div style={featureTitleStyle}>Bệnh án & Kê đơn Thuốc Điện tử</div>
                                <div style={featureDescStyle}>Tích hợp danh mục thuốc chuẩn hóa, hỗ trợ lưu nháp lâm sàng và tính liều lượng nhanh chóng.</div>
                            </div>
                        </div>
                        <div style={featureCardStyle}>
                            <ReconciliationOutlined style={featureIconStyle} />
                            <div>
                                <div style={featureTitleStyle}>Tự động hóa Viện phí & Hóa đơn</div>
                                <div style={featureDescStyle}>Tự động tổng hợp tiền khám và đơn thuốc ngay khi hoàn tất ca khám, xuất biên lai tức thì.</div>
                            </div>
                        </div>
                    </Space>
                </div>

                {/* Footer Trái */}
                <div style={{ fontSize: '12px', color: '#a0aec0', display: 'flex', justifyContent: 'space-between' }}>
                    <span>© 2026 Clinic Pro System. All rights reserved.</span>
                    <span>Phát triển cho hệ thống Y tế Số</span>
                </div>
            </Col>


            {/* ================= BÊN PHẢI ================= */}
            <Col xs={24} md={12} lg={11} style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', padding: '20px'
            }}>
                <div style={{ width: '100%', maxWidth: '360px', textAlign: 'left' }}>
                    <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: '30px' }}>Chào mừng!</Title>
                    <Text style={{ color: '#718096', fontSize: '14px', display: 'block', marginBottom: '30px', marginTop: '6px' }}>
                        Vui lòng đăng nhập tài khoản nhân sự để truy cập bàn làm việc.
                    </Text>

                    <Form name="login" onFinish={onFinish} layout="vertical" requiredMark={false}>
                        <Form.Item 
                            label={<span style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', letterSpacing: '0.5px' }}>TÊN ĐĂNG NHẬP *</span>}
                            name="username" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                            style={{ marginBottom: '20px' }}
                        >
                            <Input prefix={<UserOutlined style={{ color: '#a0aec0', marginRight: '8px' }} />} placeholder="Nhập tên tài khoản (VD: admin)" size="large" style={inputStyle} />
                        </Form.Item>

                        <Form.Item 
                            label={<span style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', letterSpacing: '0.5px' }}>MẬT KHẨU *</span>}
                            name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            style={{ marginBottom: '28px' }}
                        >
                            <Input.Password prefix={<LockOutlined style={{ color: '#a0aec0', marginRight: '8px' }} />} placeholder="Nhập mật khẩu của bạn" size="large" style={inputStyle} />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={btnStyle}>
                                Đăng nhập hệ thống <ArrowRightOutlined />
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Col>
        </Row>
    );
};

// Styles
const featureCardStyle = {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px', padding: '14px', backdropFilter: 'blur(4px)', textAlign: 'left'
};
const featureIconStyle = { fontSize: '20px', color: '#68d391', marginTop: '2px' };
const featureTitleStyle = { fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' };
const featureDescStyle = { fontSize: '12.5px', color: '#cbd5e0', lineHeight: 1.4 };
const inputStyle = { backgroundColor: '#f7f9fa', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' };
const btnStyle = { 
    backgroundColor: '#3a7668', height: '44px', borderRadius: '6px', 
    fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', 
    justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px 0 rgba(58, 118, 104, 0.39)' 
};

export default Login;