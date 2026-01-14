import { useNavigate } from 'react-router-dom';
import { BusinessSetupFlow } from '../components/BusinessSetupFlow';

export function BusinessSetup() {
    const navigate = useNavigate();

    const handleComplete = () => {
        // After setup is complete, navigate to dashboard
        navigate('/dashboard');
    };

    return <BusinessSetupFlow onComplete={handleComplete} />;
}
