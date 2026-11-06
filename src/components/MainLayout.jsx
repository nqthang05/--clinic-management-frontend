// import React, { useContext } from 'react';
// import { Layout, Menu, Button, Avatar, Typography, Space, Divider } from 'antd';
// import { useNavigate, Outlet, useLocation } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import {
//     BarChartOutlined, TeamOutlined, UserOutlined,
//     MedicineBoxOutlined, FileTextOutlined, LogoutOutlined, 
//     SolutionOutlined, DollarOutlined, CalendarOutlined,
//     BellOutlined
// } from '@ant-design/icons';

// const { Header, Sider, Content } = Layout;
// const { Text } = Typography;

// const MainLayout = () => {
//     const { user, logout } = useContext(AuthContext);
//     const navigate = useNavigate();
//     const location = useLocation();

//     // Menu Item
//     const getMenuItems = () => {
//         const items = [
//             { key: '/', icon: <BarChartOutlined />, label: 'Báo cáo & Thống kê' },
//             { key: '/patients', icon: <UserOutlined />, label: 'Bệnh nhân' },
//             { key: '/doctors', icon: <TeamOutlined />, label: 'Bác sĩ' },
//             { key: '/appointments', icon: <CalendarOutlined />, label: 'Lịch hẹn' },
//             { key: '/invoices', icon: <DollarOutlined />, label: 'Hóa đơn' },
//         ];

//         // Nhóm Quản trị (Chỉ Admin/Doctor thấy tùy quyền)
//         if (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_DOCTOR') {
//             items.push({ type: 'group', label: 'CHUYÊN MÔN LÂM SÀNG', children: [
//                 { key: '/medical-records', icon: <SolutionOutlined />, label: 'Bệnh án' },
//                 { key: '/prescriptions', icon: <MedicineBoxOutlined />, label: 'Đơn thuốc' }
//             ]});
//         }

//         if (user?.role === 'ROLE_ADMIN') {
//             items.push({ type: 'group', label: 'QUẢN TRỊ HỆ THỐNG', children: [
//                 { key: '/medicines', icon: <MedicineBoxOutlined />, label: 'Kho thuốc' },
//                 { key: '/users', icon: <TeamOutlined />, label: 'Tài khoản nhân sự' },
//             ]});
//         }
//         return items;
//     };

//     return (
//         <Layout style={{ minHeight: '100vh', backgroundColor: '#f4f7fe' }}>
            
//             {/* SIDER TRẮNG (Theo Design mới) */}
//             <Sider 
//                 theme="light" 
//                 width={260}
//                 style={{
//                     height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0,
//                     borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column'
//                 }}
//             >
//                 {/* Logo */}
//                 <div style={{ padding: '24px 24px 12px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
//                     <div style={{ background: '#00b578', padding: '6px', borderRadius: '8px', color: '#fff' }}>
//                         <BarChartOutlined style={{ fontSize: '18px' }}/>
//                     </div>
//                     <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#00b578' }}>CLINIC PRO</span>
//                 </div>

//                 {/* Danh sách Menu (Cuộn được nếu dài) */}
//                 <div style={{ flex: 1, overflowY: 'auto' }}>
//                     <Menu 
//                         mode="inline" 
//                         selectedKeys={[location.pathname]} 
//                         items={getMenuItems()} 
//                         onClick={({ key }) => navigate(key)}
//                         style={{ borderRight: 'none', padding: '0 12px' }}
//                         // Customize CSS cho item đang active thành màu xanh
//                         className="custom-menu"
//                     />
//                 </div>

//                 {/* Phần Thông tin User & Nút Đăng xuất ở Đáy Sider */}
//                 <div style={{ padding: '20px', borderTop: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
//                     <div style={{ marginBottom: '16px' }}>
//                         <Text strong style={{ fontSize: '15px', display: 'block' }}>{user?.username}</Text>
//                         <Text type="secondary" style={{ fontSize: '12px' }}>Vai trò: {user?.role}</Text>
//                     </div>
//                     <Button danger block icon={<LogoutOutlined />} onClick={() => { logout(); navigate('/login'); }} style={{ background: '#fff0f6', borderColor: '#ffadd2', color: '#eb2f96' }}>
//                         Đăng xuất
//                     </Button>
//                 </div>
//             </Sider>

//             {/* VÙNG NỘI DUNG CHÍNH */}
//             <Layout style={{ marginLeft: 260, backgroundColor: '#f4f7fe' }}>
                
//                 {/* HEADER TRẮNG GỌN GÀNG */}
//                 <Header style={{ 
//                     background: '#fff', padding: '0 32px', display: 'flex', 
//                     justifyContent: 'space-between', alignItems: 'center',
//                     position: 'sticky', top: 0, zIndex: 1, borderBottom: '1px solid #f0f0f0', height: '72px'
//                 }}>
//                     {/* Tiêu đề trang động dựa trên Route */}
//                     <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>
//                         {location.pathname === '/' ? 'Báo cáo & Thống kê (Analytics)' : 'Quản lý Hệ thống'}
//                     </h2>

//                     {/* Menu phải (Avatar + Notification) */}
//                     <Space size="large">
//                         <Button type="text" icon={<BellOutlined style={{ fontSize: '20px', color: '#9ca3af' }} />} />
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #f0f0f0', paddingLeft: '24px' }}>
//                             <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
//                                 <div style={{ fontSize: '14px', fontWeight: '600' }}>{user?.username}</div>
//                                 <div style={{ fontSize: '12px', color: '#6b7280' }}>Quản trị viên</div>
//                             </div>
//                             <Avatar style={{ backgroundColor: '#00b578', verticalAlign: 'middle' }} size="large">
//                                 {user?.username?.charAt(0).toUpperCase()}
//                             </Avatar>
//                         </div>
//                     </Space>
//                 </Header>

//                 <Content style={{ margin: '24px 32px', overflow: 'initial' }}>
//                     <Outlet />
//                 </Content>
                
//             </Layout>
//         </Layout>
//     );
// };

// export default MainLayout;



import React, { useContext } from 'react';
import { Layout, Menu, Button, Popconfirm } from 'antd';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    DashboardOutlined, TeamOutlined, UserOutlined,
    MedicineBoxOutlined, FileTextOutlined, LogoutOutlined, 
    SolutionOutlined, DollarOutlined, CalendarOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // ==========================================
    // LỌC MENU DỰA TRÊN QUYỀN (ROLE) CỦA USER
    // ==========================================
    const getMenuItems = () => {
        const items = [];

        // 1. DASHBOARD: Chỉ Admin và Lễ tân mới được xem thống kê
        if (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_RECEPTIONIST') {
            items.push({ key: '/', icon: <DashboardOutlined />, label: 'Dashboard' });
        }

        // 2. CHUNG: Ai cũng xem được (Bác sĩ cần xem để biết lịch của mình)
        items.push({ key: '/patients', icon: <UserOutlined />, label: 'Bệnh Nhân' });
        items.push({ key: '/appointments', icon: <CalendarOutlined />, label: 'Lịch Hẹn' });

        // 3. ADMIN: Quản trị hệ thống
        if (user?.role === 'ROLE_ADMIN') {
            items.push({ key: '/users', icon: <TeamOutlined />, label: 'Tài Khoản' });
            items.push({ key: '/doctors', icon: <SolutionOutlined />, label: 'Bác Sĩ' });
            items.push({ key: '/medicines', icon: <MedicineBoxOutlined />, label: 'Kho Thuốc' });
        }

        // 4. CHUYÊN MÔN: Chỉ Admin và Bác sĩ xử lý Bệnh án & Đơn thuốc
        if (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_DOCTOR') {
            items.push({ key: '/medical-records', icon: <FileTextOutlined />, label: 'Bệnh Án' });
            items.push({ key: '/prescriptions', icon: <MedicineBoxOutlined />, label: 'Đơn Thuốc' });
        }

        // 5. THU CHI: Chỉ Admin và Lễ tân xử lý Hóa đơn (Bác sĩ bị ẩn mục này)
        if (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_RECEPTIONIST') {
            items.push({ key: '/invoices', icon: <DollarOutlined />, label: 'Hóa Đơn' });
        }

        return items;
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            
            {/* SIDER */}
            <Sider theme="dark" width={250} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, backgroundColor: '#001529' }}>
                <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    CLINIC PRO
                </div>
                <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={getMenuItems()} onClick={({ key }) => navigate(key)} style={{ padding: '16px 0' }} />
            </Sider>

            {/* CONTENT BÊN PHẢI */}
            <Layout style={{ marginLeft: 250 }}>
                
                {/* HEADER */}
                <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1, boxShadow: '0 1px 4px rgba(0,21,41,0.08)' }}>
                    <span style={{ marginRight: '16px', fontWeight: '500', color: '#4a5568' }}>
                        Xin chào, <strong style={{ color: '#3a7668' }}>{user?.username}</strong> ({user?.role})
                    </span>
                    
                    {/* BỌC NÚT ĐĂNG XUẤT BẰNG POPCONFIRM */}
                    <Popconfirm
                        title="Xác nhận đăng xuất"
                        description="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?"
                        onConfirm={handleLogout}
                        okText="Đăng xuất"
                        cancelText="Hủy"
                        placement="bottomRight"
                    >
                        <Button type="primary" danger icon={<LogoutOutlined />} style={{ borderRadius: '6px' }}>
                            Đăng Xuất
                        </Button>
                    </Popconfirm>

                </Header>

                <Content style={{ margin: '24px', overflow: 'initial' }}>
                    <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', minHeight: 'calc(100vh - 112px)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Outlet /> 
                    </div>
                </Content>
                
            </Layout>
        </Layout>
    );
};

export default MainLayout;