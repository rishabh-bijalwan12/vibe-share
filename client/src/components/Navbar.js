import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import Logo from '../image/logo.jpg';

const Navbar = () => {
  const navigate = useNavigate();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    setOpenDialog(false);
  };

  const loginStatus = () => {
    const token = localStorage.getItem("jwt");
    if (token) {
      return (
        <>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button color="inherit">Home</Button>
          </Link>
          <Link to="/createpost" style={{ textDecoration: 'none' }}>
            <Button color="inherit">Create Post</Button>
          </Link>
          <Button color="inherit" onClick={() => setOpenDialog(true)}>
            Logout
          </Button>
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
          </Link>
        </>
      );
    } else {
      return (
        <>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button color="inherit">Login</Button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button color="inherit">Signup</Button>
          </Link>
        </>
      );
    }
  };

  const toggleDrawer = (open) => {
    setOpenDrawer(open);
  };

  return (
    <AppBar position="sticky" style={{ background: 'linear-gradient(to right, #FF2D55, #0A84FF)' }}>
      <Toolbar className="flex flex-col sm:flex-row items-center justify-between">
        
        {/* Hamburger Menu for Small Screens */}
        <div className="sm:hidden absolute right-4 top-4">
          <IconButton edge="start" color="inherit" onClick={() => toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
        </div>

        {/* Logo and Navbar Links for Larger Screens - Horizontal Layout */}
        <img src={Logo} alt="VibeShare Logo" className="h-8" />
        <div className="flex items-center sm:block sm:ml-4">
          <Typography className='ml-32' variant="h6" style={{ color: 'white' }}>
            VibeShare
          </Typography>
        </div>

        {/* Navbar Links for Larger Screens - Right-Aligned */}
        <div className="flex space-x-4 ml-auto sm:block hidden">
          {loginStatus()}
        </div>
      </Toolbar>

      {/* Drawer for Mobile */}
      <Drawer anchor="right" open={openDrawer} onClose={() => toggleDrawer(false)}>
        <List className="w-64">
          {/* Display Links Based on Login Status */}
          {localStorage.getItem("jwt") ? (
            <>
              <ListItem button component={Link} to="/" onClick={() => toggleDrawer(false)}>
                <ListItemText primary="Home" />
              </ListItem>
              <ListItem button component={Link} to="/createpost" onClick={() => toggleDrawer(false)}>
                <ListItemText primary="Create Post" />
              </ListItem>
              <ListItem button onClick={() => setOpenDialog(true)}>
                <ListItemText primary="Logout" />
              </ListItem>
              <ListItem button component={Link} to="/profile" onClick={() => toggleDrawer(false)}>
                <ListItemText primary="Profile" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button component={Link} to="/login" onClick={() => toggleDrawer(false)}>
                <ListItemText primary="Login" />
              </ListItem>
              <ListItem button component={Link} to="/register" onClick={() => toggleDrawer(false)}>
                <ListItemText primary="Signup" />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="secondary">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;
