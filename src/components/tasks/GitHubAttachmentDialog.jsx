import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  Pagination,
  Card,
  CardContent,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  AccountTree as BranchIcon,
  Code as CommitIcon,
  BugReport as IssueIcon,
  CallMerge as PullRequestIcon,
  Search as SearchIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Star as StarIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { githubAPI, tasksAPI } from '../../services/api';
import useGitHubAttachments from '../../hooks/useGitHubAttachments';

const getSteps = (preselectedType) => {
  if (preselectedType) {
    return ['Select Repository', `Select ${preselectedType}s`];
  }
  return ['Select Repository', 'Choose Item Type', 'Select Items'];
};

const itemTypes = [
  { 
    type: 'branch', 
    label: 'Branch', 
    icon: <BranchIcon />, 
    description: 'Attach a specific branch',
    color: '#2196F3'
  },
  { 
    type: 'commit', 
    label: 'Commit', 
    icon: <CommitIcon />, 
    description: 'Attach a specific commit',
    color: '#4CAF50'
  },
  { 
    type: 'issue', 
    label: 'Issue', 
    icon: <IssueIcon />, 
    description: 'Attach an issue',
    color: '#FF9800'
  },
  { 
    type: 'pull_request', 
    label: 'Pull Request', 
    icon: <PullRequestIcon />, 
    description: 'Attach a pull request',
    color: '#9C27B0'
  }
];

function GitHubAttachmentDialog({ 
  boardId, 
  cardId, 
  taskId, 
  isOpen, 
  onClose, 
  onAttachmentUpdated,
  preselectedType = ''
}) {
  const { addAttachment } = useGitHubAttachments(boardId, cardId, taskId);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  
  const [repositories, setRepositories] = useState([]);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [showBranchSelection, setShowBranchSelection] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen) {
      if (preselectedType) {
        setCurrentStep(0);
        setSelectedType(preselectedType);
      } else {
        setCurrentStep(0);
        setSelectedType('');
      }
      setSelectedRepo(null);
      setSelectedItems([]);
      setSearchQuery('');
      setPage(1);
      setSelectedBranch(null);
      setBranches([]);
      setShowBranchSelection(false);
      fetchRepositories();
    }
  }, [isOpen, preselectedType]);

  useEffect(() => {
    const currentType = selectedType || preselectedType;
    const isItemSelectionStep = preselectedType ? currentStep === 1 : currentStep === 2;
    
    if (selectedRepo && currentType && isItemSelectionStep && !loading) {
      const timeoutId = setTimeout(() => {
        fetchItems();
      }, searchQuery ? 500 : 0); // Debounce search by 500ms, immediate for other changes
      
      return () => clearTimeout(timeoutId);
    }
  }, [page, searchQuery, selectedBranch]); // Only depend on these specific changes

  const fetchRepositories = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await githubAPI.getRepositories();
      setRepositories(response.data.repositories || []);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError('Failed to load repositories. Please connect your GitHub account.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchesForRepo = async (repoObj) => {
    if (!repoObj) return;
    
    try {
      let owner, repo;
      if (repoObj.full_name) {
        [owner, repo] = repoObj.full_name.split('/');
      } else if (repoObj.owner && repoObj.name) {
        owner = repoObj.owner.login;
        repo = repoObj.name;
      } else {
        return;
      }
      const response = await githubAPI.getBranchesPaginated(owner, repo, { per_page: 100 });
      setBranches(response.data.branches || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchBranches = async () => {
    await fetchBranchesForRepo(selectedRepo);
  };

  const fetchItemsForRepo = async (repoObj, itemType) => {
    
    if (!repoObj || !itemType) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let owner, repo;
      if (repoObj.full_name) {
        [owner, repo] = repoObj.full_name.split('/');
      } else if (repoObj.owner && repoObj.name) {
        owner = repoObj.owner.login;
        repo = repoObj.name;
      } else {
        console.error('Invalid repository object structure:', repoObj);
        throw new Error('Invalid repository object structure');
      }
      
      const params = {
        page,
        per_page: 20,
        search: searchQuery
      };

      // Add branch filtering for commits
      if (itemType === 'commit' && selectedBranch) {
        params.sha = selectedBranch.name;
      }

      let response;
      switch (itemType) {
        case 'branch':
          response = await githubAPI.getBranchesPaginated(owner, repo, params);
          break;
        case 'commit':
          response = await githubAPI.getCommitsPaginated(owner, repo, params);
          break;
        case 'issue':
          response = await githubAPI.getIssuesPaginated(owner, repo, params);
          break;
        case 'pull_request':
          response = await githubAPI.getPullRequestsPaginated(owner, repo, params);
          break;
        default:
          throw new Error('Invalid item type');
      }

      const data = response.data;
      let itemsData = [];
      switch (itemType) {
        case 'branch':
          itemsData = data.branches || [];
          break;
        case 'commit':
          itemsData = data.commits || [];
          break;
        case 'issue':
          itemsData = data.issues || [];
          break;
        case 'pull_request':
          itemsData = data.pulls || [];
          break;
        default:
          itemsData = [];
      }
      
      const processedItems = itemsData.map(item => {
        switch (itemType) {
          case 'commit':
            return {
              ...item,
              author: item.author ,
              date: item.date 
            };
          case 'branch':
            return {
              ...item,
              commit: {
                ...item.commit,
                author: item.author 
              }
            };
          case 'issue':
          case 'pull_request':
            return {
              ...item,
              author: item.user, 
              createdAt: item.created_at
            };
          default:
            return item;
        }
      });
      
      setItems(processedItems);
      setTotalPages(Math.ceil((data.total || processedItems.length) / 20));
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error fetching items:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setError(`Failed to load ${itemType}s: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    const currentType = selectedType || preselectedType;
    
    if (!selectedRepo || !currentType) {
      return;
    }
    
    await fetchItemsForRepo(selectedRepo, currentType);
  };  
  const handleRepoSelect = async (repo) => {
    setSelectedRepo(repo);
    setSearchQuery(''); 
    
    if (preselectedType) {
      setSelectedType(preselectedType);
      setLoading(true);
      setItems([]); 
      setError('');
      
      try {
        if (preselectedType === 'commit') {
          await fetchBranchesForRepo(repo);
          setCurrentStep(1);
          setLoading(false);
        } else {
          await fetchItemsForRepo(repo, preselectedType);
          setCurrentStep(1);
        }
      } catch (error) {
        console.error('Error in handleRepoSelect:', error);
        setError(`Failed to load ${preselectedType === 'commit' ? 'branches' : preselectedType + 's'}`);
        setLoading(false);
      }
    } else {
      setCurrentStep(1);
    }
  };

  const handleTypeSelect = async (type) => {
    setSelectedType(type);
    setPage(1);
    setSelectedBranch(null);
    setSearchQuery(''); 
    setLoading(true);
    setItems([]); 
    setError('');
    
    try {
      if (type === 'commit') {
        await fetchBranchesForRepo(selectedRepo);
        setCurrentStep(2);
        setLoading(false);
        setShowBranchSelection(true);
      } else {
        await fetchItemsForRepo(selectedRepo, type);
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Error in handleTypeSelect:', error);
      setError(`Failed to load ${type === 'commit' ? 'branches' : type + 's'}`);
      setLoading(false);
    }
  };

  const handleItemToggle = (item) => {
    const itemKey = getItemKey(item);
    const isSelected = selectedItems.some(selected => getItemKey(selected) === itemKey);
    
    if (isSelected) {
      setSelectedItems(prev => prev.filter(selected => getItemKey(selected) !== itemKey));
    } else {
      const formattedItem = formatItem(item);
      setSelectedItems(prev => [...prev, formattedItem]);
    }
  };

  const getItemKey = (item) => {
    switch (selectedType) {
      case 'branch':
        return `branch-${item.name}`;
      case 'commit':
        return `commit-${item.sha}`;
      case 'issue':
        return `issue-${item.issueNumber || item.number}`;
      case 'pull_request':
        return `pull-${item.pullNumber || item.number}`;
      default:
        return `${selectedType}-${item.id}`;
    }
  };

  const formatItem = (item) => {
    const baseItem = {
      type: selectedType,
      repository: {
        owner: selectedRepo.owner.login,
        name: selectedRepo.name,
        fullName: selectedRepo.full_name
      },
      url: item.html_url,
      name: item.name || item.title || `${selectedType}-${item.number || item.sha}`,
      description: item.body || item.message || item.description || '',
      created_at: item.created_at || item.date || new Date().toISOString(),
    };
    switch (selectedType) {
      case 'branch':
        return {
          ...baseItem,
          githubId: item.name,
          title: item.name,
          name: item.name,
          description: item.commit?.message || 'Branch',
          author: {
            login: item.commit?.author?.login || item.commit?.committer?.login,
            name: item.commit?.author?.name || item.commit?.committer?.name,
            avatar_url: item.commit?.author?.avatar_url || item.commit?.committer?.avatar_url
          },
          created_at: item.commit?.author?.date || item.commit?.committer?.date || new Date().toISOString(),
          metadata: {
            lastCommit: item.commit?.message,
            author: item.commit?.author?.name || item.commit?.committer?.name,
            avatarUrl: item.commit?.author?.avatar_url || item.commit?.committer?.avatar_url,
            sha: item.commit?.sha
          }
        };
      case 'commit':
        return {
          ...baseItem,
          githubId: item.sha,
          title: item.message || `Commit ${item.sha?.substring(0, 7)}`,
          name: item.message || `Commit ${item.sha?.substring(0, 7)}`,
          description: item.message || '',
          author: {
            login: item.author?.login ,
            name: item.author?.name ,
            avatar_url: item.author?.avatar_url 
          },
          created_at:  item.date || new Date().toISOString(),
          additions: item.stats?.additions,
          deletions: item.stats?.deletions,
          metadata: {
            author: item.author?.name,
            authorLogin: item.author?.login,
            avatarUrl: item.author?.avatar_url,
            date: item.date,
            sha: item.sha,
            stats: item.stats
          }
        };
      case 'issue':
        return {
          ...baseItem,
          githubId: item.issueNumber || item.number,
          title: `#${item.issueNumber || item.number} ${item.title}`,
          name: `Issue #${item.issueNumber || item.number}`,
          description: item.body || '',
          author: {
            login: item.user?.login,
            name: item.user?.name || item.user?.login,
            avatar_url: item.user?.avatar_url
          },
          created_at: item.created_at || new Date().toISOString(),
          metadata: {
            state: item.state,
            author: item.user?.name || item.user?.login,
            authorLogin: item.user?.login,
            avatarUrl: item.user?.avatar_url,
            createdAt: item.createdAt || item.created_at,
            labels: item.labels,
            number: item.number || item.issueNumber
          }
        };
      case 'pull_request':
        return {
          ...baseItem,
          githubId: item.pullNumber || item.number,
          title: `#${item.pullNumber || item.number} ${item.title}`,
          name: `Pull Request #${item.pullNumber || item.number}`,
          description: item.body || '',
          author: {
            login: item.user?.login,
            name: item.user?.name || item.user?.login,
            avatar_url: item.user?.avatar_url
          },
          created_at: item.created_at || new Date().toISOString(),
          additions: item.additions,
          deletions: item.deletions,
          metadata: {
            state: item.state,
            author: item.user?.name || item.user?.login,
            authorLogin: item.user?.login,
            avatarUrl: item.user?.avatar_url,
            createdAt: item.createdAt || item.created_at,
            head: item.head,
            base: item.base,
            number: item.number || item.pullNumber
          }
        };
      default:
        return baseItem;
    }
  };

  const handleAttach = async () => {
    if (selectedItems.length === 0) return;
    
    setLoading(true);
    
    try {
      // Use the hook's addAttachment method for real-time updates
      for (const item of selectedItems) {
        await addAttachment(item);
      }
      
      // Call the callback to notify parent component
      onAttachmentUpdated?.();
      
      onClose();
    } catch (error) {
      console.error('Error attaching items:', error);
      setError('Failed to attach items');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 2) {
        setSelectedItems([]);
      }
    }
  };

  const handleNext = () => {
    const maxStep = preselectedType ? 1 : 2;
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
    // The useEffect will handle the debounced search
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    // The useEffect will handle the fetch
  };

  const renderStepContent = () => {
    if (preselectedType) {
      // When type is preselected, skip type selection step
      switch (currentStep) {
        case 0:
          return renderRepositorySelection();
        case 1:
          return renderItemSelection();
        default:
          return null;
      }
    } else {
      // Normal 3-step flow
      switch (currentStep) {
        case 0:
          return renderRepositorySelection();
        case 1:
          return renderTypeSelection();
        case 2:
          return renderItemSelection();
        default:
          return null;
      }
    }
  };

  const renderRepositorySelection = () => (
    <Box>
      <TextField
        fullWidth
        placeholder="Search repositories..."
        value={searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {repositories
            .filter(repo => 
              repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((repo) => (
            <ListItem key={repo.id} disablePadding>
              <ListItemButton onClick={() => handleRepoSelect(repo)}>
                <ListItemIcon>
                  <Avatar src={repo.owner.avatar_url} sx={{ width: 32, height: 32 }}>
                    <FolderIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={repo.full_name}
                  secondary={
                    <Box component="span" display="flex" alignItems="center" gap={1}>
                      <StarIcon fontSize="small" />
                      <Typography component="span" variant="caption">{repo.stargazers_count}</Typography>
                      <Typography component="span" variant="caption">•</Typography>
                      <Typography component="span" variant="caption">{repo.language}</Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );

  const renderTypeSelection = () => (
    <Box>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Choose what type of GitHub item you want to attach from <strong>{selectedRepo?.full_name}</strong>
      </Typography>
      
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
        {itemTypes.map((typeConfig) => (
          <Card 
            key={typeConfig.type}
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3
              }
            }}
            onClick={() => handleTypeSelect(typeConfig.type)}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box 
                sx={{ 
                  color: typeConfig.color, 
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                {React.cloneElement(typeConfig.icon, { fontSize: 'large' })}
              </Box>
              <Typography variant="h6" gutterBottom>
                {typeConfig.label}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {typeConfig.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  const renderItemSelection = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="textSecondary">
          Select {selectedType}s from <strong>{selectedRepo?.full_name}</strong>
        </Typography>
        <Chip 
          label={`${selectedItems.length} selected`} 
          color="primary" 
          size="small" 
        />
      </Box>
      
      <TextField
        fullWidth
        placeholder={`Search ${selectedType}s...`}
        value={searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {(selectedType === 'commit' || preselectedType === 'commit') && (
        <Box sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <BranchIcon fontSize="small" />
            <Typography variant="body2" color="textSecondary">
              {selectedBranch ? `Branch: ${selectedBranch.name}` : 'All branches'}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowBranchSelection(!showBranchSelection)}
            sx={{ mb: showBranchSelection ? 2 : 0 }}
          >
            Choose a different branch...
          </Button>
          
          {showBranchSelection && (
            <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={async () => {
                    setSelectedBranch(null);
                    setShowBranchSelection(false);
                    setPage(1);
                    
                    // Load commits for all branches (default branch)
                    if ((selectedType === 'commit' || preselectedType === 'commit') && selectedRepo) {
                      setLoading(true);
                      setItems([]);
                      setError('');
                      try {
                        await fetchItemsForRepo(selectedRepo, 'commit');
                      } catch (error) {
                        console.error('Error loading commits for all branches:', error);
                        setError('Failed to load commits');
                        setLoading(false);
                      }
                    }
                  }}
                  selected={!selectedBranch}
                >
                  <ListItemIcon>
                    <BranchIcon />
                  </ListItemIcon>
                  <ListItemText primary="All branches" />
                </ListItemButton>
              </ListItem>
              {branches.map((branch) => (
                <ListItem key={branch.name} disablePadding>
                  <ListItemButton 
                    onClick={async () => {
                      setSelectedBranch(branch);
                      setShowBranchSelection(false);
                      setPage(1);
                      
                      // Load commits with the selected branch
                      if ((selectedType === 'commit' || preselectedType === 'commit') && selectedRepo) {
                        setLoading(true);
                        setItems([]);
                        setError('');
                        try {
                          await fetchItemsForRepo(selectedRepo, 'commit');
                        } catch (error) {
                          console.error('Error loading commits for branch:', error);
                          setError('Failed to load commits');
                          setLoading(false);
                        }
                      }
                    }}
                    selected={selectedBranch?.name === branch.name}
                  >
                    <ListItemIcon>
                      {branch.commit?.author?.avatar_url ? (
                        <Avatar 
                          src={branch.commit.author.avatar_url} 
                          sx={{ width: 32, height: 32 }}
                          alt={branch.commit.author.name || branch.commit.author.login}
                        />
                      ) : (
                        <BranchIcon />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={branch.name}
                      secondary={
                        <Box component="span">
                          <Typography component="span" variant="caption" color="textSecondary">
                            {branch.commit?.sha?.substring(0, 7)}
                          </Typography>
                          {branch.commit?.author && (
                            <>
                              <Typography component="span" variant="caption" color="textSecondary"> • </Typography>
                              <Typography component="span" variant="caption" color="textSecondary">
                                by {branch.commit.author.name || branch.commit.author.login}
                              </Typography>
                            </>
                          )}
                          {branch.commit?.message && (
                            <>
                              <Typography component="span" variant="caption" color="textSecondary"> • </Typography>
                              <Typography component="span" variant="caption" color="textSecondary">
                                {branch.commit.message.split('\n')[0].substring(0, 50)}
                                {branch.commit.message.length > 50 ? '...' : ''}
                              </Typography>
                            </>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}
      
      {loading && (selectedType !== 'commit' && preselectedType !== 'commit') ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (selectedType === 'commit' || preselectedType === 'commit') && !selectedBranch && items.length === 0 ? (
        <Box display="flex" flexDirection="column" alignItems="center" p={3}>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Please select a branch to view commits
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Use the "Choose a different branch..." option above to select a specific branch
          </Typography>
        </Box>
      ) : loading && (selectedType === 'commit' || preselectedType === 'commit') && selectedBranch ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Box display="flex" justifyContent="center" p={3}>
          <Typography variant="body2" color="textSecondary">
            No {selectedType || preselectedType}s found
          </Typography>
        </Box>
      ) : (
        <>
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {items.map((item) => {
              const itemKey = getItemKey(item);
              const isSelected = selectedItems.some(selected => getItemKey(selected) === itemKey);
              
              return (
                <ListItem key={itemKey} disablePadding>
                  <ListItemButton onClick={() => handleItemToggle(item)}>
                    <ListItemIcon>
                      {isSelected ? (
                        <CheckIcon color="primary" />
                      ) : item.author?.avatar_url ? (
                        <Avatar 
                          src={item.author.avatar_url} 
                          sx={{ width: 32, height: 32 }}
                          alt={item.author.name || item.author.login}
                        />
                      ) : (
                        {
                          branch: <BranchIcon />,
                          commit: <CommitIcon />,
                          issue: <IssueIcon />,
                          pull_request: <PullRequestIcon />
                        }[selectedType || preselectedType]
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={getItemTitle(item)}
                      secondary={getItemSubtitle(item)}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );

  const getItemTitle = (item) => {
    switch (selectedType || preselectedType) {
      case 'branch':
        return item.name;
      case 'commit':
        return item.message || `Commit ${item.sha?.substring(0, 7)}`;
      case 'issue':
        return `#${item.issueNumber || item.number} ${item.title}`;
      case 'pull_request':
        return `#${item.pullNumber || item.number} ${item.title}`;
      default:
        return item.title || item.name;
    }
  };

  const getItemSubtitle = (item) => {
    switch (selectedType || preselectedType) {
      case 'branch':
        return `Last commit: ${item.commit?.message || item.metadata?.lastCommit || 'No commit message'}`;
      case 'commit':
        const commitAuthor = item.author?.name || item.author?.login || 'Unknown author';
        const commitDate = item.date || item.created_at;
        return `by ${commitAuthor} • ${commitDate ? new Date(commitDate).toLocaleDateString() : 'Unknown date'}`;
      case 'issue':
        const issueAuthor = item.user?.login || item.author?.login || item.metadata?.author || 'Unknown author';
        const issueDate = item.createdAt || item.created_at || item.metadata?.createdAt;
        return `${item.state || item.metadata?.state || 'open'} • by ${issueAuthor} • ${issueDate ? new Date(issueDate).toLocaleDateString() : 'Unknown date'}`;
      case 'pull_request':
        const prAuthor = item.user?.login || item.author?.login || item.metadata?.author || 'Unknown author';
        const prDate = item.createdAt || item.created_at || item.metadata?.createdAt;
        return `${item.state || item.metadata?.state || 'open'} • by ${prAuthor} • ${prDate ? new Date(prDate).toLocaleDateString() : 'Unknown date'}`;
      default:
        return '';
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableAutoFocus
      disableEnforceFocus
      PaperProps={{
        sx: {
          minHeight: 600
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <GitHubIcon />
          <Typography variant="h6">
            Attach from GitHub
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={currentStep} sx={{ mb: 3 }}>
          {getSteps(preselectedType).map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {renderStepContent()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        
        {currentStep > 0 && (
          <Button 
            onClick={handleBack}
            startIcon={<BackIcon />}
          >
            Back
          </Button>
        )}
        
        {((preselectedType && currentStep < 1) || (!preselectedType && currentStep < 2)) && selectedRepo && (currentStep === 0 || selectedType) && (
          <Button 
            onClick={handleNext}
            endIcon={<NextIcon />}
            variant="contained"
          >
            Next
          </Button>
        )}
        
        {((preselectedType && currentStep === 1) || (!preselectedType && currentStep === 2)) && (
          <Button
            onClick={handleAttach}
            disabled={selectedItems.length === 0 || loading}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}
          >
            Attach ({selectedItems.length})
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default GitHubAttachmentDialog;