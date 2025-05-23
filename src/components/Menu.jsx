import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import LogoIcon from '../images/3DK_LOGO_ICON_1300.png';
import ExitIcon from '../images/exit.png';
import { UserService } from '../UserService';

export const Menu = () => {
  const locationHistory = useHistory();
  const UserState = useSelector((store) => store.user);

  useEffect(() => {
    if (UserState.isLogged) {
      UserService.reloadBalances();
    }
  }, [UserState.isLogged]);

  const onHandleLogout = () => {
    UserService.logout();
    locationHistory.push('/');
  };

  return (
    <nav
      style={{
        background: "rgba(36,14,56,0.96)",
        color: "#fff",
        minHeight: 58,
        boxShadow: "0 2px 18px #0007",
        zIndex: 100,
        position: "sticky",
        top: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 36px",
        fontFamily: "'Montserrat', Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={LogoIcon}
          alt="Logo"
          style={{
            height: 40,
            width: 40,
            borderRadius: 12,
            boxShadow: "0 2px 8px #ff36ba44",
            marginRight: 20,
            background: "#201b2c"
          }}
        />
        <span style={{
          color: "#ffb9fa",
          fontWeight: 700,
          fontSize: 17,
          letterSpacing: 1,
          textShadow: "0 2px 8px #5325e955"
        }}>
          {UserState.isLogged && (
            <>
              {UserState.name} - <span style={{ color: "#fff" }}>Wallet:</span> {UserState.balance} - <span style={{ color: "#fff" }}>SEXY:</span> {UserService.sexyBalance}
            </>
          )}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Link to="/" style={navBtnStyle}>Main</Link>
        <Link to="/home" style={{
          ...navBtnStyle,
          opacity: UserState.isLogged ? 1 : 0.45,
          pointerEvents: UserState.isLogged ? "auto" : "none"
        }}>Home</Link>
        <Link to="/page2" style={{
          ...navBtnStyle,
          opacity: UserState.isLogged ? 1 : 0.45,
          pointerEvents: UserState.isLogged ? "auto" : "none"
        }}>Page2</Link>

        {UserState.isLogged && (
          <button style={logoutBtnStyle} onClick={onHandleLogout}>
            Logout
            <img src={ExitIcon} alt="Exit" style={{ width: 21, marginLeft: 7, marginBottom: -3 }} />
          </button>
        )}
      </div>
    </nav>
  );
};

const navBtnStyle = {
  background: "linear-gradient(90deg,#ff36ba 0%,#7e47f7 100%)",
  color: "#fff",
  fontWeight: "bold",
  border: "none",
  borderRadius: 16,
  padding: "8px 28px",
  fontSize: 18,
  marginLeft: 0,
  marginRight: 0,
  boxShadow: "0 1px 10px #ff36ba30",
  transition: "all .16s",
  cursor: "pointer",
  outline: "none",
  textDecoration: "none",
  letterSpacing: 0.5
};

const logoutBtnStyle = {
  ...navBtnStyle,
  background: "linear-gradient(90deg,#ff36ba 40%,#5325e9 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
};

export default Menu;
