import { Redirect, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { UserService } from './UserService';

const ProtectedRoute = ({ component: Component, ...rest }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(undefined);

    useEffect(() => {
        const checkLoginStatus = () => {
            const status = UserService.isLogged();
            setIsLoggedIn(status);
        };
        // Una pequeña demora para dar tiempo a que UserService.init() termine
        const timer = setTimeout(checkLoginStatus, 100); 
        return () => clearTimeout(timer);
    }, []);

    if (isLoggedIn === undefined) {
        // Muestra el spinner mientras se comprueba el estado de la sesión
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <Route {...rest} render={
            props => {
                if (isLoggedIn) {
                    return <Component {...rest} {...props} />
                } else {
                    return <Redirect to={
                        {
                            pathname: '/', // Redirige a la landing page
                            state: {
                                from: props.location
                            }
                        }
                    } />
                }
            }
        } />
    )
}

export default ProtectedRoute;