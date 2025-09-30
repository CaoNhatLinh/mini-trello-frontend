import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  IconButton,
  Grid,
  Divider,
  Card,
  CardContent,
  Avatar,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import "./TaskDetailDialog.css";
import {
  Close as CloseIcon,
  Save as SaveIcon,
  GitHub as GitHubIcon,
  AccountTree as BranchIcon,
  Code as CommitIcon,
  BugReport as IssueIcon,
  CallMerge as PullRequestIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  Link as LinkIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import GitHubAttachmentDialog from "./GitHubAttachmentDialog";
import GitHubAttachmentList from "./GitHubAttachmentList";
import { tasksAPI } from "../../services/api";

const getAvatarInitials = (name) => {
  if (!name || typeof name !== "string") return "?";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

function TaskDetailDialog({
  task,
  boardId,
  cardId,
  isOpen,
  onClose,
  onSave,
  onAttachmentUpdated,
  boardMembers = [],
}) {
  const [editedTask, setEditedTask] = useState({});
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [selectedGithubType, setSelectedGithubType] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      setEditedTask({
        title: task?.title || "",
        description: task?.description || "",
        githubAttachments: task?.githubAttachments || [],
      });
      setAssignedMembers(task?.assignedTo || []);
      setPriority(task?.priority || "");
      setDueDate(task?.dueDate ? task.dueDate.split("T")[0] : "");
      setHasChanges(false);
    }
  }, [task, isOpen, boardMembers]);

  const handleFieldChange = (field, value) => {
    setEditedTask((prev) => ({
      ...(prev || {}),
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const taskData = {
        ...editedTask,
        assignedTo: assignedMembers,
        priority: priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      };

      if (boardId && cardId) {
        await tasksAPI.updateTask(
          boardId,
          cardId,
          task.id || task._id,
          taskData
        );
      } else {
        await tasksAPI.updateTask_Legacy(task.id || task._id, taskData);
      }

      if (onSave) {
        onSave({ ...task, ...taskData });
      }

      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirmClose) return;
    }
    setHasChanges(false);
    onClose();
  };

  const handleGithubTypeSelect = (type) => {
    setSelectedGithubType(type);
    setGithubDialogOpen(true);
  };

  const handleAttachmentUpdated = (updatedTask) => {
    setEditedTask((prev) => ({
      ...(prev || {}),
      githubAttachments: updatedTask?.githubAttachments || [],
    }));
    setHasChanges(true);
    if (onAttachmentUpdated) {
      onAttachmentUpdated(updatedTask);
    }
  };

  const handleRemoveAttachment = async (attachmentId) => {
    if (
      !window.confirm("Are you sure you want to remove this GitHub attachment?")
    ) {
      return;
    }

    try {
      if (boardId && cardId) {
        await tasksAPI.removeGithubAttachment(
          boardId,
          cardId,
          task.id || task._id,
          attachmentId
        );
      } else {
        console.warn("Legacy remove attachment not implemented");
        return;
      }

      setEditedTask((prev) => ({
        ...(prev || {}),
        githubAttachments: (prev?.githubAttachments || []).filter(
          (att) => att.id !== attachmentId
        ),
      }));

      setHasChanges(true);

      if (onAttachmentUpdated) {
        onAttachmentUpdated();
      }
    } catch (error) {
      console.error("Failed to remove GitHub attachment:", error);
    }
  };

  const handleAddMember = (event, member) => {
    if (member && !assignedMembers.find((m) => m.id === member.id)) {
      setAssignedMembers((prev) => [...prev, member]);
      setSelectedMember(null);
      setHasChanges(true);
    }
  };

  const handleRemoveMember = (memberId) => {
    setAssignedMembers((prev) => prev.filter((m) => m.id !== memberId));
    setHasChanges(true);
  };

  if (!task) return null;

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        className="task-detail-dialog"
        PaperProps={{
          sx: {
            backgroundColor: "#1E1F22",
            color: "#BDC1CA",
            borderRadius: 3,
            border: "1px solid #4A4B4F",
            minHeight: "70vh",
            maxHeight: "90vh",
            boxShadow:
              "0 24px 48px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.2)",
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            color: "#BDC1CA",
            borderBottom: "1px solid #4A4B4F",
            p: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {task.title || "Untitled Task"}
          </Typography>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            sx={{ color: "#BDC1CA" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, maxHeight: "80vh" }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ mb: 3 }}>
                <Card
                  sx={{
                    backgroundColor: "rgba(45, 46, 49, 0.2)",
                    border: "1px solid #4A4B4F",
                    borderRadius: 3,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#BDC1CA",
                        mb: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <EditIcon /> Task Details
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "#BDC1CA", fontWeight: 600, mb: 1.5 }}
                      >
                        Title *
                      </Typography>
                      <TextField
                        fullWidth
                        value={editedTask.title || ""}
                        onChange={(e) =>
                          handleFieldChange("title", e.target.value)
                        }
                        variant="outlined"
                        placeholder="Enter task title..."
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "#BDC1CA",
                            backgroundColor: "rgba(45, 46, 49, 0.3)",
                            "& fieldset": { borderColor: "#4A4B4F" },
                            "&:hover fieldset": { borderColor: "#8E44AD" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#8E44AD",
                            },
                          },
                          "& .MuiInputBase-input::placeholder": {
                            color: "#8E8E93",
                            opacity: 1,
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "#BDC1CA", fontWeight: 600, mb: 1.5 }}
                      >
                        Description
                      </Typography>
                      <TextField
                        fullWidth
                        value={editedTask.description || ""}
                        onChange={(e) =>
                          handleFieldChange("description", e.target.value)
                        }
                        multiline
                        rows={4}
                        variant="outlined"
                        placeholder="Add a description to help others understand what this task is about..."
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "#BDC1CA",
                            backgroundColor: "rgba(45, 46, 49, 0.3)",
                            "& fieldset": { borderColor: "#4A4B4F" },
                            "&:hover fieldset": { borderColor: "#8E44AD" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#8E44AD",
                            },
                          },
                          "& .MuiInputBase-input::placeholder": {
                            color: "#8E8E93",
                            opacity: 1,
                          },
                        }}
                      />
                    </Box>

                    {/* Priority and Due Date */}
                    <Grid container spacing={2}>
                      <Grid size={6}>
                        <Typography
                          variant="subtitle1"
                          sx={{ color: "#BDC1CA", fontWeight: 600, mb: 1.5 }}
                        >
                          Priority
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            value={priority}
                            onChange={(e) => {
                              setPriority(e.target.value);
                              setHasChanges(true);
                            }}
                            sx={{
                              color: "#BDC1CA",
                              backgroundColor: "rgba(45, 46, 49, 0.5)",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#4A4B4F",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#8E44AD",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                { borderColor: "#8E44AD" },
                              "& .MuiSvgIcon-root": { color: "#BDC1CA" },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  backgroundColor: "#1E1F22",
                                  border: "1px solid #4A4B4F",
                                  borderRadius: 2,
                                  mt: 1,
                                },
                              },
                            }}
                          >
                            <MenuItem value="">
                              <em style={{ color: "#8E8E93" }}>No Priority</em>
                            </MenuItem>
                            <MenuItem value="low">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    background:
                                      "linear-gradient(45deg, #27AE60, #2ECC71)",
                                  }}
                                />
                                <Typography sx={{ color: "#BDC1CA" }}>
                                  Low Priority
                                </Typography>
                              </Box>
                            </MenuItem>
                            <MenuItem value="medium">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    background:
                                      "linear-gradient(45deg, #F39C12, #F1C40F)",
                                  }}
                                />
                                <Typography sx={{ color: "#BDC1CA" }}>
                                  Medium Priority
                                </Typography>
                              </Box>
                            </MenuItem>
                            <MenuItem value="high">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    background:
                                      "linear-gradient(45deg, #E74C3C, #FF6B6B)",
                                  }}
                                />
                                <Typography sx={{ color: "#BDC1CA" }}>
                                  High Priority
                                </Typography>
                              </Box>
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid size={6}>
                        <Typography
                          variant="subtitle1"
                          sx={{ color: "#BDC1CA", fontWeight: 600, mb: 1.5 }}
                        >
                          Due Date
                        </Typography>
                        <TextField
                          fullWidth
                          type="date"
                          value={dueDate}
                          onChange={(e) => {
                            setDueDate(e.target.value);
                            setHasChanges(true);
                          }}
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              color: "#BDC1CA",
                              backgroundColor: "rgba(45, 46, 49, 0.5)",
                              "& fieldset": { borderColor: "#4A4B4F" },
                              "&:hover fieldset": { borderColor: "#8E44AD" },
                              "&.Mui-focused fieldset": {
                                borderColor: "#8E44AD",
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>

              <GitHubAttachmentList
                boardId={boardId}
                cardId={cardId}
                taskId={task?.id || task?._id}
                showHeader={true}
                autoFetch={true}
                onAttachmentRemoved={(attachmentId) => {
                  setEditedTask((prev) => ({
                    ...prev,
                    githubAttachments: (prev?.githubAttachments || []).filter(
                      (att) => att.id !== attachmentId
                    ),
                  }));

                  if (onAttachmentUpdated) {
                    onAttachmentUpdated();
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              {/* Members Section */}
              <Box sx={{ mb: 3 }}>
                <Card
                  sx={{
                    backgroundColor: "rgba(45, 46, 49, 0.2)",
                    border: "1px solid #4A4B4F",
                    borderRadius: 3,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        color: "#BDC1CA",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <PersonIcon /> Team Members
                    </Typography>

                    {/* Add Member Section */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#8E8E93", mb: 1.5, fontWeight: 500 }}
                      >
                        Add Team Member
                      </Typography>
                      <Autocomplete
                        options={boardMembers.filter(
                          (user) =>
                            !assignedMembers.find((m) => m.id === user.id)
                        )}
                        getOptionLabel={(option) => {
                          return (
                            option.displayName ||
                            option.name ||
                            option.email ||
                            option.username ||
                            "Unknown User"
                          );
                        }}
                        value={selectedMember}
                        onChange={handleAddMember}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Search and select members..."
                            variant="outlined"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                color: "#BDC1CA",
                                backgroundColor: "rgba(45, 46, 49, 0.5)",
                                "& fieldset": { borderColor: "#4A4B4F" },
                                "&:hover fieldset": { borderColor: "#8E44AD" },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#8E44AD",
                                },
                              },
                              "& .MuiInputBase-input::placeholder": {
                                color: "#8E8E93",
                                opacity: 0.7,
                              },
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box
                            component="li"
                            {...props}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              p: 2,
                              borderRadius: 1,
                              margin: "2px 4px",
                              "&:hover": {
                                backgroundColor: "rgba(142, 68, 173, 0.1)",
                                borderRadius: 2,
                              },
                            }}
                          >
                            <Avatar
                              src={option.photoURL}
                              sx={{
                                width: 36,
                                height: 36,
                                fontSize: "0.8rem",
                                backgroundColor: "#8E44AD",
                                border: "2px solid rgba(142, 68, 173, 0.2)",
                              }}
                            >
                              {getAvatarInitials(
                                option.displayName ||
                                  option.name ||
                                  option.email
                              )}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: "#BDC1CA" }}
                              >
                                {option.displayName ||
                                  option.name ||
                                  option.username ||
                                  "Unknown User"}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#8E8E93", fontSize: "0.75rem" }}
                              >
                                {option.email || "No email available"}
                              </Typography>
                            </Box>
                            <PersonAddIcon
                              sx={{ color: "#8E44AD", opacity: 0.7 }}
                            />
                          </Box>
                        )}
                        PaperComponent={(props) => (
                          <Paper
                            {...props}
                            sx={{
                              backgroundColor: "#1E1F22",
                              border: "1px solid #4A4B4F",
                              borderRadius: 3,
                              mt: 1,
                              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                              maxHeight: 300,
                            }}
                          />
                        )}
                      />
                    </Box>

                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#8E8E93", mb: 2, fontWeight: 500 }}
                      >
                        Assigned Members ({assignedMembers.length})
                      </Typography>

                      {assignedMembers.length > 0 ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                          }}
                        >
                          {assignedMembers.map((member) => (
                            <Box
                              key={member.id}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                p: 2,
                                backgroundColor: "rgba(142, 68, 173, 0.1)",
                                border: "1px solid rgba(142, 68, 173, 0.2)",
                                borderRadius: 3,
                              }}
                            >
                              <Avatar
                                src={member.photoURL}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  fontSize: "0.8rem",
                                  backgroundColor: "#8E44AD",
                                  border: "2px solid rgba(142, 68, 173, 0.3)",
                                }}
                              >
                                {getAvatarInitials(
                                  member.displayName ||
                                    member.name ||
                                    member.email
                                )}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, color: "#BDC1CA" }}
                                >
                                  {member.displayName ||
                                    member.name ||
                                    member.email}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#8E8E93", fontSize: "0.75rem" }}
                                >
                                  {member.email || "No email available"}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveMember(member.id)}
                                sx={{
                                  color: "#FF6B6B",
                                  backgroundColor: "rgba(255, 107, 107, 0.1)",
                                  "&:hover": {
                                    color: "#FF5252",
                                    backgroundColor: "rgba(255, 107, 107, 0.2)",
                                  },
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 3,
                            px: 2,
                            backgroundColor: "rgba(45, 46, 49, 0.3)",
                            borderRadius: 2,
                            border: "1px dashed #4A4B4F",
                          }}
                        >
                          <PersonIcon
                            sx={{ fontSize: 40, color: "#8E8E93", mb: 1 }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "#8E8E93", fontStyle: "italic" }}
                          >
                            No members assigned to this task yet
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Box>
                <Card
                  sx={{
                    backgroundColor: "rgba(45, 46, 49, 0.2)",
                    border: "1px solid #4A4B4F",
                    borderRadius: 3,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        color: "#BDC1CA",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <GitHubIcon /> GitHub Actions
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <Button
                        onClick={() => handleGithubTypeSelect("branch")}
                        variant="outlined"
                        startIcon={<BranchIcon />}
                        sx={{
                          justifyContent: "flex-start",
                          color: "#7BFF7B",
                          borderColor: "#4A7C4A",
                          backgroundColor: "rgba(26, 43, 26, 0.3)",
                          textTransform: "none",
                          py: 1.2,
                          fontWeight: 500,
                          "&:hover": {
                            backgroundColor: "rgba(26, 43, 26, 0.6)",
                            borderColor: "#5A8C5A",
                          },
                        }}
                      >
                        Attach Branch
                      </Button>

                      <Button
                        onClick={() => handleGithubTypeSelect("commit")}
                        variant="outlined"
                        startIcon={<CommitIcon />}
                        sx={{
                          justifyContent: "flex-start",
                          color: "#7B9BFF",
                          borderColor: "#4A5FC7",
                          backgroundColor: "rgba(26, 29, 41, 0.3)",
                          textTransform: "none",
                          py: 1.2,
                          fontWeight: 500,
                          "&:hover": {
                            backgroundColor: "rgba(26, 29, 41, 0.6)",
                            borderColor: "#5A6FC7",
                          },
                        }}
                      >
                        Attach Commit
                      </Button>

                      <Button
                        onClick={() => handleGithubTypeSelect("issue")}
                        variant="outlined"
                        startIcon={<IssueIcon />}
                        sx={{
                          justifyContent: "flex-start",
                          color: "#FF7B7B",
                          borderColor: "#C74A4A",
                          backgroundColor: "rgba(41, 26, 26, 0.3)",
                          textTransform: "none",
                          py: 1.2,
                          fontWeight: 500,
                          "&:hover": {
                            backgroundColor: "rgba(41, 26, 26, 0.6)",
                            borderColor: "#C75A5A",
                          },
                        }}
                      >
                        Attach Issue
                      </Button>

                      <Button
                        onClick={() => handleGithubTypeSelect("pull_request")}
                        variant="outlined"
                        startIcon={<PullRequestIcon />}
                        sx={{
                          justifyContent: "flex-start",
                          color: "#FFBB7B",
                          borderColor: "#C7974A",
                          backgroundColor: "rgba(41, 36, 26, 0.3)",
                          textTransform: "none",
                          py: 1.2,
                          fontWeight: 500,
                          "&:hover": {
                            backgroundColor: "rgba(41, 36, 26, 0.6)",
                            borderColor: "#C7A75A",
                          },
                        }}
                      >
                        Attach Pull Request
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, borderTop: "1px solid #4A4B4F" }}>
          <Button
            onClick={handleClose}
            sx={{
              color: "#8E8E93",
              px: 3,
              py: 1,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!hasChanges}
            sx={{
              backgroundColor: "#8E44AD",
              px: 4,
              py: 1,
              "&:hover": { backgroundColor: "#7D3C98" },
              "&:disabled": { backgroundColor: "#4A4B4F" },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <GitHubAttachmentDialog
        boardId={boardId}
        cardId={cardId}
        taskId={task.id || task._id}
        isOpen={githubDialogOpen}
        onClose={() => {
          setGithubDialogOpen(false);
          setSelectedGithubType("");
        }}
        onAttachmentUpdated={handleAttachmentUpdated}
        preselectedType={selectedGithubType}
      />
    </>
  );
}

export default TaskDetailDialog;
