# Dynamic Ecoesystem

## Business Model canvas

Given this product outline, write a business model canvas.  The canvas should include market segments for all sizes of application development. Also provide an total addressable market description. 
Also Include annual revenue based on revenu sources including:
  revenue based on the number of end users using the applications, 
    not the developer.  
    a free tier,  
    then  paid tier that got less expensive as you had more users.
    This includes covering hosting costs
   revenue from a market place for components that were built by external developers
   revenue from application that people can host and control their users like a lite version of major internet applications
     as well as others build by members of the community

## User Satisfaction

Create a demographic profile of key customers for the product.
Given that list of key customers, create a Customer Satisfaction survey and have those customers take the survey, including NPS scores and comments about the Dynamic Ecosystem.

Dynamic EcoSystem Product Outline
	The Meta_Ecosystem is made of of the individual components that in symphony work to build a scaleable application.
	meta_ui
		Model driven architecture
		Application
			defines routes
			workflows using statecharts
			Actions
				See page actions
			json based from definition language to build Pages
    Pages are built with
        Layout
            Defines how the widgets are layed out on the screen
            Includes methods for supporting variations for the different platforms
        Model
            This is the data that is represented on the page
        Enumeration
            lists of data for
                drop down lists
                selection lists
                type aheads
                ...
        Actions
            connections to services
                mqtt
                rest api
                graphql
                ...
        Workflow
            state charts
        Widget
            Model
            Workflow
            has common widgets used for application development
            Supports custom widgets, so that if meta_ui doesn't do it, the developer can
        Builds applications for anywhere
                android
                ios
                web
                mac
                windows
                linux
            Applications are simple json/yaml descriptions
            They are interpreted using an interpreter
	meta_data
		supports
			sql
			document store
			streaming
		Used for storing application data
		generated default descriptions for meta_ui
			editor
			display
			table view
			table editor
	meta_message
		collaborative
			pubsub
				model collaboration
					model state
					floating document edit
					datagrid edit
				record locking
					This is a stateChart workflow
					subscribe when opened
					unsubscribe when closed
					Publish when editing starts
					Publish when saved or cancled
		dynamic camel
			service definition
			rest services
			graph_ql
	meta_flow
		Services for workflows
			workflows based on statecharts
	meta_geo
		geospatial event system
			event driven geo spatial framework for doing location interactions
	meta_scale
		auto scale infrastructure
			a self expanding kuberneties cluster
	meta_creator
		ui designer
			AI Enabled Application builder
            Uses generative LLM's that are trained on the json_schema language definition to be able to have a conversational process to build the Application
                trained on languad definition json schemas
                trained on example applications
            A conversational AI Builder for 
                UI desig
                Action Mapping
                accelerate the development of applications.
            Features Drag and drop
                Layout
                widgets
            Event Action Mapper (Node Linking tool)
                Connects Widgets to Actions 
                    e.g. A button is pressed to save a form.
                    You connect the button widgets event to the save action
                    and the save reaction to a toast to show that the form was saved.
                action input to output
                    url
                    template
                    routing
