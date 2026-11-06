import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null;

    // Chưa đăng nhập -> Đá ra Login
    if (!user) return <Navigate to="/login" replace />;

    // Đăng nhập rồi nhưng không có quyền -> Đá về trang chủ
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;