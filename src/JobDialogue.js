import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

// graphql/apollo
import ApolloClient from "apollo-boost";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { ApolloProvider } from "react-apollo";

// helper functions
////////////////////////////////////////////////
function parseString (string, key) {

  if (string) {
    var parsedString = parseCode(string,key);

    if (key === 'description') {
      return <div dangerouslySetInnerHTML={{ __html: string }} />
    }
    
    return parsedString;    
  }  
}

function parseCamelCase (string) {
  if (string) {
    return string.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); })
  }  
}

function parseCode (string, key) {  
  let ageDecypher = {
    A_1:'Any Age',
    A_2:'Under 13',
    A_3:'13-17',
    A_4:'18-24',
    A_5:'25-34',
    A_6:'50-69',
    A_6_6:'50-69',
    A_7:'Over 18',
    A_8:'16-65'
  }

  let locationDecypher = {
    A_1:'Addis Ababa',
    A_2:'Adama',
    A_3:'Gondar',
    A_4:'Mekele',
    A_5:'Hawassa',
    A_6:'Bahir Dar',
    A_7:'Dire Dawa',
    A_8:'Dessie',
    A_9:'Jimma',
    A_10:'Jijiga',
    A_11:'Shashamane',A_12:'Arba Minch',
    A_13:'Hosaena',
    A_14:'Woliso',
    A_15:'Asmara',
    A_16:'Debre Birhan',
    A_17:'Asella',
    A_18:'Harar',
    A_19:'Dila',
    A_20:'Nekemte',
    A_21:'Unspecified'
  }

  let productionTypeDecypher = {
    A_1:'Feature',
    A_2:'Documentary',
    A_3:'TV-Series',
    A_4:'Short film',
    A_5:'Silent film',
    A_6:'Biography',
    A_7:'Other type'
  }

  let genderMfDecypher = {
    MALE:'Male',
    FEMALE:'Female',
    NOTSPECIFIED:'Not specified'
  }

  let cypher = {
    ageLevel:ageDecypher,
    location:locationDecypher,
    productionType:productionTypeDecypher,
    genderMf:genderMfDecypher

  }

  if (cypher[key]) {    
    return (cypher[key][string]||'Not specified');
  } else {
    return string;
  }  
}
////////////////////////////////////////////////

// fetch data
const client = new ApolloClient({
  uri: "https://etmdb.com/graphql"
});

const getJob = gql`
  query job ($id: ID!) {    
    job (id: $id) {      
      id
      jobTitle
      company {
        id
        companyName
        establishedIn
        description
        opensAt
        closesAt        
      }
      location
      genderMf
      ageLevel   
      salary         
      productionType
      duration
      productionDate
      closingDate
      description      
    }
  }
`;

const JobDetails = (props) => (  
  <Query 
    query={getJob} 
    variables={{"id":props.jobId}}
    skip={!props.jobId}
  >
    {({ loading, error, data }) => {      
      if (loading) return (
        <List>
          <GetSingleList key="loading" primary="Loading..." nestedClass="" />
        </List> 
        );
      if (error) return (
        <p>Error with {props.jobId}</p>
        ); 

      if (data) {
        let jobList = [];
        for (const key in data.job) {
          
          if (key !== 'company' && key !== 'id' && key !== '__typename') {            
            jobList.push(
              <GetSingleList key={key} primary={data.job[key]||'Not specified'} secondary={key} nestedClass="" />
            );
          } if (key === 'company') {
            jobList.push(
              <ListItem button key={key} onClick={props.handleClick}>
                <ListItemText inset primary="Company" secondary="Company Details" />
                {props.stateListOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
            );
            jobList.push(
              <GetNestedList key={key+'Collapse'} stateListOpen={props.stateListOpen} nestedClass={props.nestedClass} nestedObject={data.job[key]} />              
            )
          }

        }
        return (jobList);
      }            
    }}
  </Query>
);

function GetSingleList(props) {
  return (
    <ListItem button className={props.nestedClass} key={props.key} >
      <ListItemText inset primary={parseString(props.primary, props.secondary)} secondary={parseCamelCase(props.secondary)} />
    </ListItem>

  );
}

function GetNestedList(props) {
  let nestedList = [];
  for (const nestedKey in props.nestedObject) {
    if (nestedKey !== 'id' && nestedKey !== '__typename') {
      nestedList.push(
        <GetSingleList key={props.key+nestedKey} primary={props.nestedObject[nestedKey]||'Not specified'} secondary={nestedKey} nestedClass={props.nestedClass} />
      );
    }
  }
  return (
    <Collapse in={props.stateListOpen} timeout="auto" unmountOnExit key={props.key}>
      <List component="div" disablePadding>
        {nestedList}
      </List>
    </Collapse>
  );
}

const styles = theme => ({
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
});

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class FullScreenDialog extends React.Component {
  state = {    
    listOpen : false
  };  

  handleClick = () => {
    this.setState(state => ({ listOpen: !state.listOpen }));
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>        
        <Dialog
          fullScreen
          open={this.props.stateDialougeOpen}
          onClose={this.props.handleClose}
          TransitionComponent={Transition}
        >
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton color="inherit" onClick={this.props.handleClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" color="inherit" className={classes.flex}>
                 Job Details
              </Typography>              
            </Toolbar>
          </AppBar>

            

          <List>
            <ApolloProvider client={client}>
              <JobDetails jobId={this.props.jobSelected} stateListOpen={this.state.listOpen} handleClick={this.handleClick} nestedClass={classes.nested} />
            </ApolloProvider>
          </List>          

        </Dialog>
      </div>
    );
  }
}

FullScreenDialog.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FullScreenDialog);