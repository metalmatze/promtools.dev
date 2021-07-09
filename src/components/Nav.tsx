import React from "react";
import {Container, Navbar} from "react-bootstrap";
import './Nav.scss';

const Nav = () => (
    <Navbar expand="md" bg="primary" variant="dark">
        <Container>
            <Navbar.Brand href="/">PromTools.dev</Navbar.Brand>
        </Container>
    </Navbar>
);

export default Nav
