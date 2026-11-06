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

// ==========================================
// DỮ LIỆU GIẢ LẬP CHO BIỂU ĐỒ (MOCK DATA)
// ==========================================
const statusData = [
    { name: 'Đã lên lịch', value: 1 },
    { name: 'Đã xác nhận', value: 2 },
    { name: 'Đã hoàn thành', value: 5 },
    { name: 'Đã hủy', value: 0 },
];
const STATUS_COLORS = ['#3182ce', '#dd6b20', '#38a169', '#e53e3e'];

const trendData = [
    { date: '20/11', count: 1 },
    { date: '22/11', count: 3 },
    { date: '24/11', count: 2 },
    { date: '26/11', count: 6 },
    { date: '28/11', count: 4 },
    { date: '30/11', count: 7 },
];

const specialtyData = [
    { name: 'Nội tổng quát', count: 4, percent: 36 },
    { name: 'Tai - Mũi - Họng', count: 2, percent: 18 },
    { name: 'Ngoại khoa', count: 1, percent: 9 },
    { name: 'Sản phụ khoa', count: 1, percent: 9 },
    { name: 'Nhi khoa', count: 1, percent: 9 },
];

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    
    // Dữ liệu tổng quan gọi từ API Backend thật
    const [metrics, setMetrics] = useState({
        totalPatients: 0,
        totalActiveDoctors: 0,
        todayAppointments: 0,
        currentMonthRevenue: 0
    });

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/dashboard/overview');
            setMetrics(res);
        } catch (error) {
            message.error('Không thể lấy dữ liệu thống kê!');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_RECEPTIONIST') {
            fetchDashboardData();
        }
    }, [user]);

    // Màn hình chào mừng dành riêng cho BÁC SĨ
    if (user?.role === 'ROLE_DOCTOR') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
                <img src="https://cdn-icons-png.flaticon.com/512/3063/3063124.png" alt="Doctor" style={{ width: 120, opacity: 0.8, marginBottom: 20 }} />
                <Title level={2} style={{ color: '#295b50' }}>Chào mừng Bác sĩ {user?.username} trở lại!</Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>Vui lòng chọn "Lịch Hẹn" hoặc "Bệnh Án" từ menu bên trái để bắt đầu ca làm việc.</Text>
            </div>
        );
    }

    // MÀN HÌNH THỐNG KÊ CHO ADMIN / LỄ TÂN
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
                <Button icon={<SyncOutlined />} onClick={fetchDashboardData} loading={loading}>
                    Làm mới số liệu
                </Button>
            </div>

            <Spin spinning={loading}>
                {/* DÒNG 1: 4 THẺ CHỈ SỐ TỔNG QUAN (Từ API Backend) */}
                <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard 
                            title="Tổng Hồ sơ Bệnh nhân" value={metrics.totalPatients}
                            icon={<TeamOutlined />} color="#1890ff" subtext="Hồ sơ y tế lưu trữ"
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard 
                            title="Đội ngũ Bác sĩ" value={metrics.totalActiveDoctors}
                            icon={<SolutionOutlined />} color="#52c41a" subtext="Chuyên khoa hoạt động"
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard 
                            title="Lịch hẹn Hôm nay" value={metrics.todayAppointments}
                            icon={<CalendarOutlined />} color="#faad14" subtext="Ca đang chờ xử lý"
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <StatCard 
                            title="Doanh thu Tháng này" value={`${metrics.currentMonthRevenue.toLocaleString()} ₫`}
                            icon={<DollarOutlined />} color="#eb2f96" subtext="Biến động so với tháng trước"
                        />
                    </Col>
                </Row>

                {/* DÒNG 2: BIỂU ĐỒ TRẠNG THÁI LỊCH HẸN */}
                <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                    <Col xs={24} lg={16}>
                        <Card title={<><LineChartOutlined /> Biểu đồ Số lượng Lịch hẹn theo Trạng thái</>} bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {statusData.map((entry, index) => (
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
                                        <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ marginTop: 10 }}>
                                {statusData.map((item, index) => (
                                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text><span style={{ color: STATUS_COLORS[index], fontSize: 18, marginRight: 8 }}>•</span>{item.name}</Text>
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
                        <Card title={<><LineChartOutlined /> Xu hướng Lịch hẹn theo Thời gian</>} bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                                dataSource={specialtyData}
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

// Component thẻ Thống kê (StatCard)
const StatCard = ({ title, value, icon, color, subtext }) => (
    <Card style={{ borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' }} bodyStyle={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <Text style={{ color: '#8c8c8c', fontSize: '14px', fontWeight: 500 }}>{title}</Text>
                <Title level={2} style={{ margin: '8px 0', fontWeight: 'bold', color: '#2c3e50' }}>
                    {value}
                </Title>
            </div>
            <div style={{ backgroundColor: `${color}15`, padding: '12px', borderRadius: '50%', color: color, fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
        </div>
        <div style={{ marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>{subtext}</Text>
            <a style={{ fontSize: '12px', color: color }}>Chi tiết →</a>
        </div>
    </Card>
);

export default Dashboard;