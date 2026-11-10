import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Typography, Spin, message, Button, Progress, List } from 'antd';
import { 
    TeamOutlined, SolutionOutlined, CalendarOutlined, DollarOutlined,
    SyncOutlined, LineChartOutlined, PieChartOutlined
} from '@ant-design/icons';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;

const STATUS_COLORS = ['#3182ce', '#dd6b20', '#38a169', '#e53e3e'];

// Dịch Status từ Backend sang Tiếng Việt cho mượt
const STATUS_MAP = {
    'PENDING': 'Chờ xác nhận',
    'CONFIRMED': 'Đã xác nhận',
    'COMPLETED': 'Khám xong',
    'CANCELLED': 'Đã hủy'
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    
    // State lưu trữ dữ liệu thực từ API Backend
    const [metrics, setMetrics] = useState({
        totalPatients: 0,
        totalActiveDoctors: 0,
        todayAppointments: 0,
        currentMonthRevenue: 0,
        statusData: [],
        trendData: [],
        specialtyData: []
    });

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/dashboard/overview');
            
            // Format lại mảng statusData để dịch sang tiếng Việt trước khi render
            const formattedStatusData = res.statusData?.map(item => ({
                name: STATUS_MAP[item.name] || item.name,
                value: item.value
            })) || [];

            // Ép kiểu tường minh để chắc chắn dữ liệu Tổng Bệnh Nhân được cập nhật
            setMetrics({
                totalPatients: res.totalPatients || 0,
                totalActiveDoctors: res.totalActiveDoctors || 0,
                todayAppointments: res.todayAppointments || 0,
                currentMonthRevenue: res.currentMonthRevenue || 0,
                statusData: formattedStatusData,
                trendData: res.trendData || [],
                specialtyData: res.specialtyData || []
            });
        } catch (error) {
            message.error('Không thể lấy dữ liệu thống kê!');
        }
        setLoading(false);
    };

    // Tự động fetch data khi vào trang (Dành cho Admin/Lễ tân)
    useEffect(() => {
        if (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_RECEPTIONIST') {
            fetchDashboardData();
        }
    }, [user]);

    // Màn hình riêng cho Bác sĩ (Bác sĩ không xem thống kê doanh thu/bệnh nhân)
    if (user?.role === 'ROLE_DOCTOR') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
                <img src="https://cdn-icons-png.flaticon.com/512/3063/3063124.png" alt="Doctor" style={{ width: 120, opacity: 0.8, marginBottom: 20 }} />
                <Title level={2} style={{ color: '#295b50' }}>Chào mừng Bác sĩ {user?.username} trở lại!</Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>Vui lòng chọn "Lịch Hẹn" hoặc "Bệnh Án" từ menu bên trái để bắt đầu ca làm việc.</Text>
            </div>
        );
    }

    // MÀN HÌNH CHÍNH CHO ADMIN / LỄ TÂN
    return (
        <div>
            {/* Header Dashboard */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: '#295b50', padding: '8px 12px', borderRadius: '8px' }}>
                        <LineChartOutlined style={{ fontSize: '24px', color: 'white' }} />
                    </div>
                    <div>
                        <Title level={3} style={{ margin: 0, color: '#2c3e50' }}>Trung tâm Phân tích & Thống kê Y tế</Title>
                        <Text type="secondary">Theo dõi chỉ số vận hành (KPI), lưu lượng bệnh nhân thời gian thực</Text>
                    </div>
                </div>
                <Button icon={<SyncOutlined />} onClick={fetchDashboardData} loading={loading} type="primary" ghost>
                    Làm mới số liệu
                </Button>
            </div>

            <Spin spinning={loading}>
                {/* DÒNG 1: 4 THẺ CHỈ SỐ TỔNG QUAN */}
                <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard 
                            title="Tổng Hồ sơ Bệnh nhân" 
                            value={metrics.totalPatients} 
                            icon={<TeamOutlined />} 
                            color="#1890ff" 
                            subtext="Hồ sơ y tế đang lưu trữ" 
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard 
                            title="Đội ngũ Bác sĩ" 
                            value={metrics.totalActiveDoctors} 
                            icon={<SolutionOutlined />} 
                            color="#52c41a" 
                            subtext="Bác sĩ đang công tác" 
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard 
                            title="Lịch hẹn Hôm nay" 
                            value={metrics.todayAppointments} 
                            icon={<CalendarOutlined />} 
                            color="#faad14" 
                            subtext="Tổng số ca khám trong ngày" 
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard 
                            title="Doanh thu Tháng này" 
                            value={`${metrics.currentMonthRevenue.toLocaleString()} ₫`} 
                            icon={<DollarOutlined />} 
                            color="#eb2f96" 
                            subtext="Dựa trên hóa đơn đã thanh toán" 
                        />
                    </Col>
                </Row>

                {/* DÒNG 2: BIỂU ĐỒ TRẠNG THÁI LỊCH HẸN */}
                <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                    <Col xs={24} lg={16}>
                        <Card title={<><LineChartOutlined /> Biểu đồ Số lượng Lịch hẹn theo Trạng thái</>} bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={metrics.statusData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {metrics.statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card title={<><PieChartOutlined /> Cơ cấu Trạng thái</>} bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '100%', height: 200, display: 'flex', justifyContent: 'center' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={metrics.statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {metrics.statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ marginTop: 10 }}>
                                {metrics.statusData.map((item, index) => (
                                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text><span style={{ color: STATUS_COLORS[index % STATUS_COLORS.length], fontSize: 18, marginRight: 8 }}>•</span>{item.name}</Text>
                                        <Text strong>{item.value} ca</Text>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* DÒNG 3: XU HƯỚNG & NHÂN SỰ */}
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <Card title={<><LineChartOutlined /> Xu hướng Lịch hẹn 7 ngày qua</>} bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={metrics.trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#38b2ac" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#38b2ac" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="count" stroke="#319795" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card title={<><TeamOutlined /> Nhân sự theo Chuyên khoa</>} bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            <List
                                itemLayout="horizontal"
                                dataSource={metrics.specialtyData}
                                renderItem={item => (
                                    <List.Item style={{ borderBottom: 'none', padding: '10px 0' }}>
                                        <div style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <Text strong>{item.name}</Text>
                                                <Text type="secondary">{item.count} Bác sĩ ({item.percent}%)</Text>
                                            </div>
                                            <Progress percent={item.percent} showInfo={false} strokeColor="#13c2c2" trailColor="#e6f7ff" />
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
};

// ==========================================
// CẬP NHẬT: ĐÃ XÓA NÚT "CHI TIẾT ->"
// ==========================================
const StatCard = ({ title, value, icon, color, subtext }) => (
    <Card style={{ borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' }} bodyStyle={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <Text style={{ color: '#8c8c8c', fontSize: '14px', fontWeight: 500 }}>{title}</Text>
                <Title level={2} style={{ margin: '8px 0', fontWeight: 'bold', color: '#2c3e50' }}>{value}</Title>
            </div>
            <div style={{ backgroundColor: `${color}15`, padding: '12px', borderRadius: '50%', color: color, fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
        </div>
        {/* Chỉ hiển thị dòng text mô tả, hoàn toàn xóa bỏ thẻ Link "Chi tiết" */}
        <div style={{ marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>{subtext}</Text>
        </div>
    </Card>
);

export default Dashboard;