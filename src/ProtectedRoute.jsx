import { Redirect, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { UserService } from './UserService';

const ProtectedRoute = ({ component: Component, ...rest }) => {
    const [authStatus, setAuthStatus] = useState(undefined);

    useEffect(() => {
        const checkLoginStatus = async () => {
            while (UserService.isInitializing) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            const status = UserService.isLogged();
            setAuthStatus(status);
        };
        
        checkLoginStatus();
    }, []);

    if (authStatus === undefined) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <Route {...rest} render={
            props => {
                if (authStatus) {
                    return <Component {...rest} {...props} />
                } else {
                    return <Redirect to={{ pathname: '/' }} />
                }
            }
        } />
    )
}

export default ProtectedRoute;