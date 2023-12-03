import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faCheck,
  faPenToSquare,
  faXmark,
  faMagnifyingGlass,
  faChevronLeft,
  faAnglesLeft,
  faAngleRight,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";

const UserTable = () => {
  // State to hold the fetched users and loading status
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); 
  const usersPerPage = 10; 
  const [value, setValue] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const termRef = useRef("");

  const [filteredUsers, setFilteredUsers] = useState([]); 
  const [editableUsers, setEditableUsers] = useState([]);
  
  const [selectAll, setSelectAll] = useState(false); 

  // Fetch data from the API on component mount
  useEffect(() => {
    axios
      .get(
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      )
      .then((response) => {
        setUsers(response.data); // Set fetched users
        setLoading(false); // Update loading status
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false); // Update loading status in case of an error
      });
  }, []); // Empty dependency array ensures useEffect runs only on component mount

  // Logic to paginate users based on filtered or original users
  const dataToPaginate = termRef.current == "" ? users : filteredUsers;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = dataToPaginate.slice(indexOfFirstUser, indexOfLastUser);

  // Change page

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (event) => {
    setValue(event.target.value);
    if (event.target.value == "") {
      termRef.current = "";
    }
  };

  // Handle search submission on Enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      filterUsers();
    }
  };

  // Filter users based on search term
  const filterUsers = () => {
    termRef.current = value;
    if (termRef.current != "") {
      const filtered = users.filter((user) =>
        Object.values(user).some((value) =>
          String(value).toLowerCase().includes(termRef.current.toLowerCase())
        )
      );
      setFilteredUsers(filtered);
      setCurrentPage(1); // Reset pagination to first page
    }
  };

  // Function to handle user selection with checkboxes
  const handleSelectUser = (userId) => {
    const selectedIndex = selectedUsers.indexOf(userId);
    let newSelectedUsers = [];

    if (selectedIndex === -1) {
      newSelectedUsers = [...selectedUsers, userId];
    } else {
      newSelectedUsers = selectedUsers.filter((id) => id !== userId);
    }

    setSelectedUsers(newSelectedUsers);
  };

  // Function to delete selected users
  const handleDeleteUsers = () => {
    const updatedUsers = users.filter(
      (user) => !selectedUsers.includes(user.id)
    );
    setUsers(updatedUsers);
    setSelectedUsers([]);
  };

  // Function to delete a specific user
  const handleDeleteUser = (userId) => {
    const updatedUsers = users.filter((user) => user.id !== userId);
    setUsers(updatedUsers);
  };

  // Placeholder for edit functionality
  const handleEditUser = (userId) => {
    console.log(`Edit user with ID: ${userId}`);
  };

  // Function to toggle edit mode for a user
  const toggleEdit = (userId) => {
    const updatedEditableUsers = [...editableUsers];
    const index = updatedEditableUsers.findIndex((user) => user.id === userId);

    if (index !== -1) {
      updatedEditableUsers.splice(index, 1);
    } else {
      updatedEditableUsers.push({ id: userId, name: "" });
    }

    setEditableUsers(updatedEditableUsers);
  };

  // Function to handle changes in editable user name
  const handleEditChange = (userId, newName) => {
    const updatedEditableUsers = editableUsers.map((user) =>
      user.id === userId ? { ...user, name: newName } : user
    );
    setEditableUsers(updatedEditableUsers);
  };

  // Function to save edited user data
  const handleSave = (userId) => {
    const updatedUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            name: editableUsers.find(
              (editableUser) => editableUser.id === userId
            ).name,
          }
        : user
    );
    setUsers(updatedUsers);
    toggleEdit(userId);
  };

  // Function to cancel editing and discard changes
  const handleCancel = (userId) => {
    toggleEdit(userId);
    const updatedEditableUsers = editableUsers.filter(
      (user) => user.id !== userId
    );
    setEditableUsers(updatedEditableUsers);
  };

  // Function to select/deselect all users
  const handleSelectAll = () => {
    const selected = !selectAll;
    setSelectAll(selected);
    const selectedUsersIds = selected ? users.map((user) => user.id) : [];
    setSelectedUsers(selectedUsersIds);
  };

  return (
    <div className="App">
      <div className="search_box">
        <div>
          <input
            type="text"
            placeholder="Search..."
            value={value}
            onChange={handleSearch}
            onKeyPress={handleKeyPress}
          />
          <FontAwesomeIcon
            className="search"
            icon={faMagnifyingGlass}
            onClick={filterUsers}
          />
        </div>
        <FontAwesomeIcon
          icon={faTrash}
          className="trash_top"
          onClick={handleDeleteUsers}
        />
      </div>
      {loading ? ( // Conditional rendering based on loading status
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <td className="checkbox_cell">
                <label class="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <span class="checkmark"></span>
                </label>
              </td>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>role</th>
              <th>actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <label class="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                    <span class="checkmark"></span>
                  </label>
                </td>
                <td>{user.id}</td>
                <td>
                  {editableUsers.some(
                    (editableUser) => editableUser.id === user.id
                  ) ? (
                    <input
                      type="text"
                      value={
                        editableUsers.find(
                          (editableUser) => editableUser.id === user.id
                        )?.name || user.name
                      }
                      onChange={(e) =>
                        handleEditChange(user.id, e.target.value)
                      }
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  {editableUsers.some(
                    (editableUser) => editableUser.id === user.id
                  ) ? (
                    <>
                      <FontAwesomeIcon
                        className="good"
                        icon={faCheck}
                        button
                        onClick={() => handleSave(user.id)}
                      />
                      <FontAwesomeIcon
                        className="close"
                        icon={faXmark}
                        onClick={() => handleCancel(user.id)}
                      />
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        className="edit"
                        icon={faPenToSquare}
                        onClick={() => toggleEdit(user.id)}
                      />
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="trash"
                        onClick={() => handleDeleteUser(user.id)}
                      />
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="page_div">
        <FontAwesomeIcon
          onClick={() => paginate(1)}
          className="back"
          icon={faAnglesLeft}
        />
        <FontAwesomeIcon
          onClick={() => paginate(currentPage - 1)}
          className="first"
          icon={faChevronLeft}
        />

        {[...Array(Math.ceil(users.length / usersPerPage)).keys()].map(
          (number) => (
            <span
              className="page_numbers"
              key={number + 1}
              onClick={() => paginate(number + 1)}
            >
              {number + 1}
            </span>
          )
        )}
        <FontAwesomeIcon
          onClick={() => paginate(currentPage + 1)}
          className="next"
          icon={faAngleRight}
        />
        <FontAwesomeIcon
          onClick={() => paginate(Math.ceil(users.length / usersPerPage))}
          className="last"
          icon={faAnglesRight}
        />
      </div>
    </div>
  );
};

export default UserTable;
